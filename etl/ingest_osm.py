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
import math
import os
import re
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

import psycopg
import requests
from dotenv import load_dotenv

load_dotenv()

DEFAULT_LEGACY_CSV = (
    Path(__file__).resolve().parent.parent / "database" / "seed" / "butecos_bh_geocodificado.csv"
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

        phone = tags.get("phone") or tags.get("contact:phone") or tags.get("contact:whatsapp")
        website = tags.get("website") or tags.get("contact:website")
        instagram = tags.get("contact:instagram") or tags.get("instagram")

        raw_metadata = {
            "phone": phone,
            "website": website,
            "instagram": instagram,
            "opening_hours": tags.get("opening_hours"),
            "cuisine": tags.get("cuisine"),
            "outdoor_seating": tags.get("outdoor_seating"),
            "wheelchair": tags.get("wheelchair"),
            "internet_access": tags.get("internet_access"),
            "description": tags.get("description"),
            "postcode": tags.get("addr:postcode"),
        }
        extra_metadata = {
            key: str(value).strip()
            for key, value in raw_metadata.items()
            if value is not None and str(value).strip()
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


def haversine_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula a distância geodésica aproximada em metros entre duas coordenadas."""
    earth_radius_m = 6_371_000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    return 2 * earth_radius_m * math.asin(math.sqrt(a))


def text_similarity(first: str, second: str) -> float:
    """Compara dois textos normalizados retornando similaridade entre 0.0 e 1.0."""
    return SequenceMatcher(None, slugify(first), slugify(second)).ratio()


def is_duplicate_bar(
    existing: dict[str, Any],
    candidate: dict[str, Any],
    max_distance_meters: float = 50.0,
    min_name_similarity: float = 0.80,
    min_address_similarity: float = 0.80,
) -> bool:
    """Identifica se dois bares representam o mesmo estabelecimento.

    Prioridade dos critérios:
    1. Nome normalizado (obrigatório ter similaridade >= min_name_similarity).
    2. Endereço normalizado quando ambos possuem endereço preenchido (prioritário sobre
       distância para evitar falsos positivos em ruas diferentes ou falsos negativos por
       pequenos desvios de geocodificação).
    3. Distância geográfica (fallback quando um dos registros não possui endereço).
    """
    if text_similarity(existing["name"], candidate["name"]) < min_name_similarity:
        return False

    existing_address = (existing.get("address") or "").strip()
    candidate_address = (candidate.get("address") or "").strip()
    if existing_address and candidate_address:
        return text_similarity(existing_address, candidate_address) >= min_address_similarity

    distance = haversine_meters(
        existing["latitude"],
        existing["longitude"],
        candidate["latitude"],
        candidate["longitude"],
    )
    return distance <= max_distance_meters


def deduplicate_bars(
    records: list[dict[str, Any]],
    max_distance_meters: float = 50.0,
    min_name_similarity: float = 0.80,
    min_address_similarity: float = 0.80,
) -> list[dict[str, Any]]:
    """Remove duplicatas preservando a ordem de prioridade e enriquecendo campos ausentes."""
    deduplicated: list[dict[str, Any]] = []

    for candidate in records:
        matched: dict[str, Any] | None = None
        for existing in deduplicated:
            if is_duplicate_bar(
                existing,
                candidate,
                max_distance_meters=max_distance_meters,
                min_name_similarity=min_name_similarity,
                min_address_similarity=min_address_similarity,
            ):
                matched = existing
                break

        if matched is None:
            deduplicated.append({**candidate, "metadata": dict(candidate.get("metadata") or {})})
            continue

        if not matched.get("address") and candidate.get("address"):
            matched["address"] = candidate["address"]
        if not matched.get("neighborhood") and candidate.get("neighborhood"):
            matched["neighborhood"] = candidate["neighborhood"]

        merged_metadata = dict(matched.get("metadata") or {})
        for key, value in (candidate.get("metadata") or {}).items():
            merged_metadata.setdefault(key, value)
        if candidate.get("external_id") and candidate["external_id"] != matched.get("external_id"):
            merged_metadata.setdefault("merged_external_id", candidate["external_id"])
        matched["metadata"] = merged_metadata

    return deduplicated


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

    raw_count = len(records)
    records = deduplicate_bars(records)
    merged_count = raw_count - len(records)
    if merged_count > 0:
        print(f"[ETL] Deduplicação: {merged_count} registros duplicados mesclados.")

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
