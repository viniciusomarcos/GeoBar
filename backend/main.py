"""API HTTP do GeoBar."""

import os
from typing import Annotated

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

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


@app.get("/", include_in_schema=False)
def root() -> RedirectResponse:
    return RedirectResponse(url="/docs")


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


# /bars/all precisa vir ANTES de /bars/{bar_id}
@app.get("/bars/all", response_model=list[Bar])
def list_all_bars() -> list[Bar]:
    return repository.list_all_bars()


@app.get("/bars/{bar_id}", response_model=Bar)
def get_bar(bar_id: int) -> Bar:
    bar = repository.get_bar(bar_id)
    if bar is None:
        raise HTTPException(status_code=404, detail="Bar not found")
    return bar
