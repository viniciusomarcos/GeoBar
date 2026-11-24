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
    items = [{key: value for key, value in row.items() if key != "total"} for row in rows]
    return items, total


def get_bar(bar_id: int) -> dict[str, Any] | None:
    sql = f"SELECT {BAR_COLUMNS} FROM bars WHERE id = %(id)s"
    with get_connection() as conn:
        return conn.execute(sql, {"id": bar_id}).fetchone()
backend/main.py
python
"""API HTTP do GeoBar."""

import os
from typing import Annotated

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from backend import repository
from backend.schemas import Bar, BarPage

ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS", "http://localhost:3000,https://geo-bar.vercel.app"
).split(",")

app = FastAPI(title="GeoBar API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/bars", response_model=BarPage)
def list_bars(
    q: Annotated[str | None, Query(max_length=100)] = None,
    neighborhood: Annotated[str | None, Query(max_length=100)] = None,
    page: Annotated[int, Query(ge=1)] = 1,
) -> BarPage:
    items, total = repository.search_bars(q=q, neighborhood=neighborhood, page=page)
    return BarPage(items=items, page=page, page_size=repository.PAGE_SIZE, total=total)


@app.get("/bars/{bar_id}", response_model=Bar)
def get_bar(bar_id: int) -> Bar:
    bar = repository.get_bar(bar_id)
    if bar is None:
        raise HTTPException(status_code=404, detail="Bar not found")
    return bar