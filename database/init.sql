-- GeoBar: Schema inicial com PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS bars (
    id BIGSERIAL PRIMARY KEY,
    external_id TEXT UNIQUE,
    name TEXT NOT NULL,
    address TEXT,
    neighborhood TEXT,
    category TEXT NOT NULL DEFAULT 'bar',
    source TEXT NOT NULL DEFAULT 'legacy_csv',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice espacial GIST para acelerar ST_DWithin / ST_Distance / buscas por área
CREATE INDEX IF NOT EXISTS idx_bars_location_gist
    ON bars
    USING GIST (location);

-- Índices auxiliares para filtros futuros (categoria e origem dos dados)
CREATE INDEX IF NOT EXISTS idx_bars_category ON bars (category);
CREATE INDEX IF NOT EXISTS idx_bars_source ON bars (source);
