"""Consultas SQL/PostGIS sobre a tabela bars."""

from typing import Any

from backend.db import get_connection

PAGE_SIZE = 12

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


def get_bar(bar_id: int) -> dict[str, Any] | None:
    sql = f"SELECT {BAR_COLUMNS} FROM bars WHERE id = %(id)s"
    with get_connection() as conn:
        return conn.execute(sql, {"id": bar_id}).fetchone()
