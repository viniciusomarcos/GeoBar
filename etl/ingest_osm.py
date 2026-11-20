"""ETL de ingestão de bares de Belo Horizonte para o PostgreSQL/PostGIS.

Suporta duas fontes:
1. Dataset legado (CSV geocodificado do Comida di Buteco 2026)
2. OpenStreetMap via Overpass API (amenity=bar|pub|biergarten em Belo Horizonte)

Exemplos de uso:
    python -m etl.ingest_osm --source legacy --dry-run
    python -m etl.ingest_osm --source osm --dry-run
    python -m etl.ingest_osm --source all
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import unicodedata
from pathlib import Path
from typing import Any

import psycopg
import requests
from dotenv import load_dotenv

load_dotenv()

DEFAULT_LEGACY_CSV = Path(
    "_legacy_tp/tp1-geometria-computacional-main/tp1/butecos_bh_geocodificado.csv"
)
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# Consulta Overpass para bares, pubs e biergartens dentro da área administrativa de Belo Horizonte
OVERPASS_QUERY = """
[out:json][timeout:60];
area["name"="Belo Horizonte"]["admin_level"="8"]->.bh;
(
  node["amenity"~"^(bar|pub|biergarten)$"](area.bh);
  way["amenity"~"^(bar|pub|biergarten)$"](area.bh);
  relation["amenity"~"^(bar|pub|biergarten)$"](area.bh);
);
out center tags;
"""


def slugify(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", normalized.lower()).strip("-")
    return slug or "unnamed"


def extract_neighborhood_from_address(address: str) -> str | None:
    """Extrai o bairro quando o endereço segue o padrão 'Logradouro, Número, Bairro'."""
    parts = [part.strip() for part in address.split(",") if part.strip()]
    if len(parts) >= 3:
        return parts[-1]
    return None


def load_legacy_csv(csv_path: Path = DEFAULT_LEGACY_CSV) -> list[dict[str, Any]]:
    """Lê e normaliza o CSV geocodificado do projeto legado (TP1)."""
    if not csv_path.exists():
        raise FileNotFoundError(f"Arquivo CSV legado não encontrado: {csv_path}")

    records: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    with csv_path.open(mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file, delimiter=";")
        for idx, row in enumerate(reader, start=1):
            raw_name = (row.get("name") or "").strip().lstrip(",").strip()
            raw_address = (row.get("address") or "").strip()
            raw_lat = (row.get("latitude") or "").strip()
            raw_lon = (row.get("longitude") or "").strip()

            if not raw_name or not raw_lat or not raw_lon:
                continue

            lat = float(raw_lat)
            lon = float(raw_lon)

            base_id = f"legacy:{slugify(raw_name)}"
            external_id = base_id if base_id not in seen_ids else f"{base_id}-{idx}"
            seen_ids.add(external_id)

            records.append(
                {
                    "external_id": external_id,
                    "name": raw_name,
                    "address": raw_address or None,
                    "neighborhood": extract_neighborhood_from_address(raw_address),
                    "category": "buteco",
                    "source": "legacy_csv",
                    "metadata": {"dataset": "comida_di_buteco_2026"},
                    "latitude": lat,
                    "longitude": lon,
                }
            )

    return records


def parse_osm_elements(elements: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Normaliza elementos retornados pela Overpass API para o schema da tabela bars."""
    records: list[dict[str, Any]] = []
    for element in elements:
        tags = element.get("tags", {})
        name = (tags.get("name") or "").strip()
        if not name:
            continue

        if element.get("type") == "node":
            lat = element.get("lat")
            lon = element.get("lon")
        else:
            center = element.get("center") or {}
            lat = center.get("lat")
            lon = center.get("lon")

        if lat is None or lon is None:
            continue

        street = tags.get("addr:street")
        housenumber = tags.get("addr:housenumber")
        neighborhood = tags.get("addr:suburb") or tags.get("addr:neighbourhood")

        address_parts = [p for p in [street, housenumber, neighborhood] if p]
        address = ", ".join(address_parts) if address_parts else None

        extra_metadata = {
            key: value
            for key, value in tags.items()
            if key in {"phone", "website", "opening_hours", "cuisine", "outdoor_seating"}
        }

        records.append(
            {
                "external_id": f"osm:{element['type']}/{element['id']}",
                "name": name,
                "address": address,
                "neighborhood": neighborhood,
                "category": tags.get("amenity", "bar"),
                "source": "osm",
                "metadata": extra_metadata,
                "latitude": float(lat),
                "longitude": float(lon),
            }
        )

    return records


def fetch_osm_bars(timeout: int = 60) -> list[dict[str, Any]]:
    """Busca bares de Belo Horizonte via Overpass API (OpenStreetMap)."""
    response = requests.post(
        OVERPASS_URL,
        data={"data": OVERPASS_QUERY},
        headers={"User-Agent": "GeoBar-ES2-UFMG/0.1 (ETL script)"},
        timeout=timeout,
    )
    response.raise_for_status()
    payload = response.json()
    return parse_osm_elements(payload.get("elements", []))


def upsert_bars(records: list[dict[str, Any]], database_url: str) -> int:
    """Insere ou atualiza bares no PostgreSQL/PostGIS de forma idempotente."""
    if not records:
        return 0

    sql = """
        INSERT INTO bars (
            external_id,
            name,
            address,
            neighborhood,
            category,
            source,
            metadata,
            location,
            updated_at
        )
        VALUES (
            %(external_id)s,
            %(name)s,
            %(address)s,
            %(neighborhood)s,
            %(category)s,
            %(source)s,
            %(metadata)s::jsonb,
            ST_SetSRID(ST_MakePoint(%(longitude)s, %(latitude)s), 4326)::geography,
            NOW()
        )
        ON CONFLICT (external_id) DO UPDATE SET
            name = EXCLUDED.name,
            address = EXCLUDED.address,
            neighborhood = EXCLUDED.neighborhood,
            category = EXCLUDED.category,
            source = EXCLUDED.source,
            metadata = EXCLUDED.metadata,
            location = EXCLUDED.location,
            updated_at = NOW();
    """

    prepared = [
        {**rec, "metadata": json.dumps(rec["metadata"], ensure_ascii=False)}
        for rec in records
    ]

    with psycopg.connect(database_url) as conn:
        with conn.cursor() as cur:
            cur.executemany(sql, prepared)
        conn.commit()

    return len(prepared)


def main() -> None:
    parser = argparse.ArgumentParser(description="ETL de bares de BH para PostGIS.")
    parser.add_argument(
        "--source",
        choices=["legacy", "osm", "all"],
        default="legacy",
        help="Fonte de dados a ingerir (padrão: legacy).",
    )
    parser.add_argument(
        "--csv-path",
        type=Path,
        default=DEFAULT_LEGACY_CSV,
        help="Caminho para o CSV geocodificado legado.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Apenas extrai e exibe um resumo sem gravar no banco de dados.",
    )
    args = parser.parse_args()

    records: list[dict[str, Any]] = []
    if args.source in ("legacy", "all"):
        legacy_records = load_legacy_csv(args.csv_path)
        print(f"[ETL] Legacy CSV: {len(legacy_records)} bares carregados.")
        records.extend(legacy_records)

    if args.source in ("osm", "all"):
        osm_records = fetch_osm_bars()
        print(f"[ETL] OpenStreetMap (Overpass): {len(osm_records)} bares carregados.")
        records.extend(osm_records)

    if args.dry_run:
        print(f"[ETL] Dry-run ativo. Total preparado: {len(records)} registros.")
        for sample in records[:3]:
            print("  Exemplo:", sample)
        return

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError(
            "Defina a variável de ambiente DATABASE_URL antes de rodar sem --dry-run."
        )

    count = upsert_bars(records, database_url)
    print(f"[ETL] Sucesso: {count} registros inseridos/atualizados na tabela 'bars'.")


if __name__ == "__main__":
    main()
