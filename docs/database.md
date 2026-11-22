# Banco de Dados Geoespacial (PostgreSQL + PostGIS)

Este documento descreve a modelagem da tabela `bars`, os índices espaciais, exemplos de consultas PostGIS para integração com o Backend e o fluxo de execução local com Docker e ETL.

---

## 1. Dicionário de Dados — Tabela `bars`

Schema definido em [`database/init.sql`](../database/init.sql) com a extensão `postgis` habilitada.

| Coluna | Tipo | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identificador interno autoincremental. |
| `external_id` | `TEXT` | `UNIQUE` | Identificador estável da origem (`legacy:<slug>` ou `osm:<type>/<id>`), usado para `UPSERT` idempotente. |
| `name` | `TEXT` | `NOT NULL` | Nome do estabelecimento. |
| `address` | `TEXT` | — | Endereço formatado (logradouro, número e bairro quando disponível). |
| `neighborhood` | `TEXT` | — | Bairro em Belo Horizonte (extraído do endereço legado ou das tags `addr:suburb` / `addr:neighbourhood` do OSM). |
| `category` | `TEXT` | `NOT NULL DEFAULT 'bar'` | Categoria do local (`buteco`, `bar`, `pub`, `biergarten`). |
| `source` | `TEXT` | `NOT NULL DEFAULT 'legacy_csv'` | Origem do registro (`legacy_csv`, `osm`). |
| `metadata` | `JSONB` | `NOT NULL DEFAULT '{}'` | Dados complementares flexíveis (ex.: `dataset`, `phone`, `website`, `opening_hours`, `outdoor_seating`, `merged_external_id`). |
| `location` | `GEOGRAPHY(Point, 4326)` | `NOT NULL` | Coordenada geográfica WGS84 `(longitude, latitude)` para cálculos geodésicos nativos em metros. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Data/hora de criação do registro. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Data/hora da última atualização via ETL. |

### Índices Criados
- `idx_bars_location_gist` (`GIST (location)`): acelera buscas espaciais por raio (`ST_DWithin`) e área (`ST_MakeEnvelope`), substituindo a árvore K-D em memória do projeto legado.
- `idx_bars_category` (`BTREE (category)`): acelera filtros por categoria.
- `idx_bars_source` (`BTREE (source)`): acelera filtros por fonte de dados.

---

## 2. Exemplos de Queries PostGIS (Referência para o Backend)

> **Atenção:** no PostGIS, `ST_MakePoint(longitude, latitude)` recebe **longitude primeiro e latitude depois**.

### 2.1 Busca circular por raio (ordenada por distância em metros)
```sql
SELECT
    id,
    name,
    address,
    neighborhood,
    category,
    source,
    ST_Y(location::geometry) AS latitude,
    ST_X(location::geometry) AS longitude,
    ROUND(
        ST_Distance(
            location,
            ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography
        )::numeric,
        2
    )::double precision AS distance_meters
FROM bars
WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
    :radius_meters
)
ORDER BY distance_meters ASC
LIMIT 100;
```

### 2.2 Busca retangular (bounding box — equivalente à busca ortogonal do TP1)
```sql
SELECT
    id,
    name,
    address,
    neighborhood,
    category,
    ST_Y(location::geometry) AS latitude,
    ST_X(location::geometry) AS longitude
FROM bars
WHERE location::geometry && ST_MakeEnvelope(:lon_min, :lat_min, :lon_max, :lat_max, 4326)
ORDER BY name ASC;
```

### 2.3 Filtro por bairro e categoria
```sql
SELECT id, name, address, neighborhood, category
FROM bars
WHERE neighborhood ILIKE :neighborhood
  AND category = :category
ORDER BY name ASC;
```

### 2.4 Verificar uso do índice espacial GiST
```sql
EXPLAIN ANALYZE
SELECT id, name
FROM bars
WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(-43.9380, -19.9320), 4326)::geography,
    1500
);
```

---

## 3. Setup Local com Docker Compose e Carga via ETL

### 3.1 Subir o PostgreSQL/PostGIS local
```bash
cp .env.example .env
docker compose up -d
```

Na primeira inicialização, o container executa automaticamente `database/init.sql`.

### 3.2 Rodar o pipeline ETL
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt

# Simulação sem gravar no banco (CSV legado)
python -m etl.ingest_osm --source legacy --dry-run

# Carga real no banco configurado em DATABASE_URL
python -m etl.ingest_osm --source legacy
python -m etl.ingest_osm --source osm
python -m etl.ingest_osm --source all
```

### 3.3 Regras de deduplicação no ETL
Ao combinar múltiplas fontes (`--source all`), o ETL aplica deduplicação priorizando:
1. **Nome normalizado** (similaridade mínima padrão `0.80`).
2. **Endereço normalizado** quando ambos os registros possuem endereço (prioritário sobre distância para evitar mesclar bares vizinhos em ruas diferentes ou perder duplicatas por pequenos desvios de geocodificação).
3. **Distância geodésica (`haversine`) ≤ 50m** como fallback quando um dos registros não possui endereço (comum em nós do OpenStreetMap).

Quando uma duplicata é identificada, o registro principal é mantido e enriquecido com `address`, `neighborhood` e `metadata` faltantes.
