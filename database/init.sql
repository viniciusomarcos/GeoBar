-- GeoBar: initial PostGIS schema
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

-- Spatial GiST index for ST_DWithin, ST_Distance, and area queries
CREATE INDEX IF NOT EXISTS idx_bars_location_gist
    ON bars
    USING GIST (location);

-- Supporting indexes for future category and data source filters
CREATE INDEX IF NOT EXISTS idx_bars_category ON bars (category);
CREATE INDEX IF NOT EXISTS idx_bars_source ON bars (source);
