from contextlib import contextmanager

import pytest
from fastapi.testclient import TestClient

from backend import db, repository
from backend.main import app

client = TestClient(app)

SAMPLE_BAR = {
    "id": 1,
    "name": "Bar do Zé",
    "address": "Rua da Bahia, 100, Centro",
    "neighborhood": "Centro",
    "category": "buteco",
    "source": "legacy_csv",
    "metadata": {},
    "latitude": -19.92,
    "longitude": -43.94,
}


class FakeResult:
    def __init__(self, rows):
        self.rows = rows

    def fetchall(self):
        return self.rows

    def fetchone(self):
        return self.rows[0] if self.rows else None


class FakeConnection:
    def __init__(self, rows):
        self.rows = rows
        self.calls = []

    def execute(self, sql, params=None):
        self.calls.append((sql, params))
        return FakeResult(self.rows)


def use_fake_db(monkeypatch, rows):
    conn = FakeConnection(rows)

    @contextmanager
    def fake_get_connection():
        yield conn

    monkeypatch.setattr(repository, "get_connection", fake_get_connection)
    return conn


def test_health_returns_ok():
    assert client.get("/health").json() == {"status": "ok"}


def test_list_bars_returns_paginated_results(monkeypatch):
    monkeypatch.setattr(repository, "search_bars", lambda **kw: ([SAMPLE_BAR], 1))
    body = client.get("/bars?q=ze").json()
    assert body["total"] == 1
    assert body["page_size"] == 12
    assert body["items"][0]["name"] == "Bar do Zé"


def test_list_bars_rejects_page_zero():
    assert client.get("/bars?page=0").status_code == 422


def test_get_bar_returns_bar(monkeypatch):
    monkeypatch.setattr(repository, "get_bar", lambda bar_id: SAMPLE_BAR)
    assert client.get("/bars/1").json()["neighborhood"] == "Centro"


def test_get_bar_returns_404_when_missing(monkeypatch):
    monkeypatch.setattr(repository, "get_bar", lambda bar_id: None)
    assert client.get("/bars/999").status_code == 404


def test_search_bars_computes_offset_and_strips_total(monkeypatch):
    conn = use_fake_db(monkeypatch, [{**SAMPLE_BAR, "total": 30}])
    items, total = repository.search_bars(q="ze", page=3)
    assert total == 30
    assert "total" not in items[0]
    assert conn.calls[0][1]["offset"] == 24


def test_search_bars_returns_zero_when_empty(monkeypatch):
    use_fake_db(monkeypatch, [])
    assert repository.search_bars() == ([], 0)


def test_get_bar_repository_returns_none_when_missing(monkeypatch):
    use_fake_db(monkeypatch, [])
    assert repository.get_bar(42) is None


def test_get_connection_requires_database_url(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    with pytest.raises(RuntimeError), db.get_connection():
        pass


def test_root_redirects_to_docs():
    response = client.get("/", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/docs"


def test_all_bars_route_returns_every_bar(monkeypatch):
    monkeypatch.setattr(repository, "list_all_bars", lambda: [SAMPLE_BAR, SAMPLE_BAR])
    response = client.get("/bars/all")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_all_bars_passes_limit(monkeypatch):
    conn = use_fake_db(monkeypatch, [SAMPLE_BAR])
    assert repository.list_all_bars(limit=5) == [SAMPLE_BAR]
    assert conn.calls[0][1] == {"limit": 5}
