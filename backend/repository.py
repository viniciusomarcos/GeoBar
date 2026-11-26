"""Consultas SQL/PostGIS sobre a tabela bars."""

from typing import Any

from backend.db import get_connection

PAGE_SIZE = 12
MAX_ALL_BARS = 2000

BAR_COLUMNS = """
    id, name, address, neighborhood, category, source, metadata,
    ST_Y(location::geometry) AS latitude,
    ST_X(location::geometry) AS longitude
"""


def search_bars(
    q: str | None = None,
    neighborhood: str | None = None,
    page: int = 1,
    page_size: int = PAGE_SIZE,
) -> tuple[list[dict[str, Any]], int]:
    """Busca paginada por nome, bairro ou endereço. Retorna (itens, total)."""
    sql = f"""
        SELECT {BAR_COLUMNS}, COUNT(*) OVER() AS total
        FROM bars
        WHERE (
            %(q)s::text IS NULL
            OR name ILIKE '%%' || %(q)s || '%%'
            OR neighborhood ILIKE '%%' || %(q)s || '%%'
            OR address ILIKE '%%' || %(q)s || '%%'
        )
          AND (%(neighborhood)s::text IS NULL OR neighborhood ILIKE %(neighborhood)s)
        ORDER BY name ASC, id ASC
        LIMIT %(limit)s OFFSET %(offset)s
    """
    params = {
        "q": q,
        "neighborhood": neighborhood,
        "limit": page_size,
        "offset": (page - 1) * page_size,
    }
    with get_connection() as conn:
        rows = conn.execute(sql, params).fetchall()

    total = rows[0]["total"] if rows else 0
    items = [
        {key: value for key, value in row.items() if key != "total"} for row in rows
    ]
    return items, total


def list_all_bars(limit: int = MAX_ALL_BARS) -> list[dict[str, Any]]:
    """Todos os bares de uma vez, para o frontend filtrar no navegador."""
    sql = f"SELECT {BAR_COLUMNS} FROM bars ORDER BY name ASC, id ASC LIMIT %(limit)s"
    with get_connection() as conn:
        return conn.execute(sql, {"limit": limit}).fetchall()


def get_bar(bar_id: int) -> dict[str, Any] | None:
    sql = f"SELECT {BAR_COLUMNS} FROM bars WHERE id = %(id)s"
    with get_connection() as conn:
        return conn.execute(sql, {"id": bar_id}).fetchone()

MAX_NEARBY_RADIUS_M = 10_000


def find_nearby_bars(
    latitude: float,
    longitude: float,
    radius_m: int = 1000,
    limit: int = 20,
) -> list[dict[str, Any]]:
    sql = f"""
        SELECT {BAR_COLUMNS},
               ST_Distance(location, ref.point) AS distance_m
        FROM bars,
             (SELECT ST_SetSRID(ST_MakePoint(%(lng)s, %(lat)s), 4326)::geography
                     AS point) AS ref
        WHERE ST_DWithin(location, ref.point, %(radius)s)
        ORDER BY distance_m ASC, id ASC
        LIMIT %(limit)s
    """
    params = {"lat": latitude, "lng": longitude, "radius": radius_m, "limit": limit}
    with get_connection() as conn:
        return conn.execute(sql, params).fetchall()
