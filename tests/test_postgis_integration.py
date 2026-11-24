import os
from pathlib import Path

import psycopg
import pytest

from etl.ingest_osm import upsert_bars

INIT_SQL_PATH = Path(__file__).resolve().parent.parent / "database" / "init.sql"


def _require_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        pytest.skip("DATABASE_URL não configurada; pulando testes de integração PostGIS.")
    return database_url


@pytest.fixture()
def postgis_db() -> str:
    """Garante schema limpo via database/init.sql antes de cada teste de integração."""
    database_url = _require_database_url()
    init_sql = INIT_SQL_PATH.read_text(encoding="utf-8")

    with psycopg.connect(database_url) as conn:
        with conn.cursor() as cur:
            cur.execute(init_sql)
            cur.execute("TRUNCATE TABLE bars RESTART IDENTITY;")
        conn.commit()

    return database_url


@pytest.mark.integration
def test_init_sql_creates_postgis_table_and_gist_index(postgis_db: str) -> None:
    with psycopg.connect(postgis_db) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT extname FROM pg_extension WHERE extname = 'postgis';")
            assert cur.fetchone() == ("postgis",)

            cur.execute(
                """
                SELECT indexname
                FROM pg_indexes
                WHERE tablename = 'bars' AND indexname = 'idx_bars_location_gist';
                """
            )
            assert cur.fetchone() == ("idx_bars_location_gist",)


@pytest.mark.integration
def test_upsert_bars_is_idempotent_in_postgis(postgis_db: str) -> None:
    bar = {
        "external_id": "legacy:baiuca",
        "name": "Baiúca",
        "address": "Rua Piauí, 1884, Funcionários",
        "neighborhood": "Funcionários",
        "category": "buteco",
        "source": "legacy_csv",
        "metadata": {"dataset": "comida_di_buteco_2026"},
        "latitude": -19.9358597,
        "longitude": -43.9279865,
    }

    assert upsert_bars([bar], postgis_db) == 1

    updated_bar = {
        **bar,
        "metadata": {"dataset": "comida_di_buteco_2026", "phone": "+55 31 3222-0000"},
    }
    assert upsert_bars([updated_bar], postgis_db) == 1

    with psycopg.connect(postgis_db) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*), MAX(metadata->>'phone') FROM bars;")
            count, phone = cur.fetchone()

    assert count == 1
    assert phone == "+55 31 3222-0000"


@pytest.mark.integration
def test_spatial_radius_query_orders_bars_by_distance(postgis_db: str) -> None:
    bars = [
        {
            "external_id": "legacy:baiuca",
            "name": "Baiúca",
            "address": "Rua Piauí, 1884, Funcionários",
            "neighborhood": "Funcionários",
            "category": "buteco",
            "source": "legacy_csv",
            "metadata": {},
            "latitude": -19.9358597,
            "longitude": -43.9279865,
        },
        {
            "external_id": "legacy:bar-do-tiao",
            "name": "Bar do Tião",
            "address": "Avenida Doutor Cristiano Guimarães, 2570, Planalto",
            "neighborhood": "Planalto",
            "category": "buteco",
            "source": "legacy_csv",
            "metadata": {},
            "latitude": -19.8354846,
            "longitude": -43.9553743,
        },
    ]
    upsert_bars(bars, postgis_db)

    # Busca de 2 km a partir da Praça da Liberdade (-19.9320, -43.9380)
    with psycopg.connect(postgis_db) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    name,
                    ST_Distance(
                        location,
                        ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography
                    ) AS distance_meters
                FROM bars
                WHERE ST_DWithin(
                    location,
                    ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
                    %s
                )
                ORDER BY distance_meters ASC;
                """,
                (-43.9380, -19.9320, -43.9380, -19.9320, 2000.0),
            )
            rows = cur.fetchall()

    assert len(rows) == 1
    assert rows[0][0] == "Baiúca"
    assert 900.0 <= rows[0][1] <= 1300.0


@pytest.mark.integration
def test_spatial_bounding_box_query_filters_bars(postgis_db: str) -> None:
    bars = [
        {
            "external_id": "legacy:baiuca",
            "name": "Baiúca",
            "address": "Rua Piauí, 1884, Funcionários",
            "neighborhood": "Funcionários",
            "category": "buteco",
            "source": "legacy_csv",
            "metadata": {},
            "latitude": -19.9358597,
            "longitude": -43.9279865,
        },
        {
            "external_id": "legacy:bar-do-tiao",
            "name": "Bar do Tião",
            "address": "Avenida Doutor Cristiano Guimarães, 2570, Planalto",
            "neighborhood": "Planalto",
            "category": "buteco",
            "source": "legacy_csv",
            "metadata": {},
            "latitude": -19.8354846,
            "longitude": -43.9553743,
        },
    ]
    upsert_bars(bars, postgis_db)

    # Retângulo cobrindo apenas a região Centro-Sul (Funcionários / Savassi)
    with psycopg.connect(postgis_db) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT name
                FROM bars
                WHERE location::geometry && ST_MakeEnvelope(%s, %s, %s, %s, 4326)
                ORDER BY name ASC;
                """,
                (-43.95, -19.95, -43.91, -19.91),
            )
            rows = cur.fetchall()

    assert rows == [("Baiúca",)]
