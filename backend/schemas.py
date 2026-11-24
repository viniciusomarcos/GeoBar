"""Modelos de resposta da API."""

from typing import Any

from pydantic import BaseModel


class Bar(BaseModel):
    id: int
    name: str
    address: str | None
    neighborhood: str | None
    category: str
    source: str
    metadata: dict[str, Any]
    latitude: float
    longitude: float


class BarPage(BaseModel):
    items: list[Bar]
    page: int
    page_size: int
    total: int
