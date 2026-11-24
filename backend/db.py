"""Conexão com o PostgreSQL/PostGIS."""

import os
from collections.abc import Iterator
from contextlib import contextmanager

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

load_dotenv()


@contextmanager
def get_connection() -> Iterator[psycopg.Connection]:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("Defina a variável de ambiente DATABASE_URL.")
    with psycopg.connect(database_url, row_factory=dict_row) as conn:
        yield conn
