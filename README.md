# GeoBar

[![Frontend main](https://github.com/viniciusomarcos/GeoBar/actions/workflows/frontend-main.yml/badge.svg?branch=main)](https://github.com/viniciusomarcos/GeoBar/actions/workflows/frontend-main.yml)
[![Frontend coverage](https://codecov.io/gh/viniciusomarcos/GeoBar/branch/main/graph/badge.svg?flag=frontend)](https://codecov.io/gh/viniciusomarcos/GeoBar)
[![ETL CI](https://github.com/viniciusomarcos/GeoBar/actions/workflows/etl-ci.yml/badge.svg?branch=main)](https://github.com/viniciusomarcos/GeoBar/actions/workflows/etl-ci.yml)
[![ETL coverage](https://codecov.io/gh/viniciusomarcos/GeoBar/branch/main/graph/badge.svg?flag=etl)](https://codecov.io/gh/viniciusomarcos/GeoBar)

## Team members

- Alessandro Mesa Teppa
- Lucas Paulo Martins Mariz
- Vinícius de Oliveira Marcos

## About the system

GeoBar helps users discover bars in Belo Horizonte. Developed for Software
Engineering II at UFMG, it is inspired by
[this computational geometry project](https://github.com/amt-cc/tp1-geometria-computacional).

The frontend offers debounced bar search with 12 results per page, neighborhood
filters, an interactive map, and bar details using the public FastAPI backend.
Cards show the available category, location, and address without image placeholders.
Search state
survives detail-page navigation. The catalog loads asynchronously with skeletons,
retry, and error notifications. Portuguese (default), English, and light/dark
theme preferences are saved in the browser. A separate ETL pipeline imports
CSV and OpenStreetMap data into PostgreSQL/PostGIS (see
[docs/database.md](docs/database.md)).

Production (`main`): [geo-bar.vercel.app](https://geo-bar.vercel.app).

To start locally, install Node.js **24.x** and pnpm **10.33.4**, then run from the
repository root:

```sh
pnpm install --frozen-lockfile
pnpm start
```

Open <http://localhost:3000>. For production, use `pnpm build` and `pnpm start:prod`.
The frontend uses [the public API](https://geobar-api.onrender.com/docs) by default.
Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to override it. Browser requests
use the frontend's `/api` proxy, including Vercel previews.
Hero photo: [KC Shum / Unsplash](https://unsplash.com/photos/jwowyIij6ss).

## Technologies

- Next.js, React, and TypeScript: application and interface.
- Tailwind CSS and Lucide: styling and icons.
- next-intl: English and Portuguese translations.
- Leaflet and OpenStreetMap: interactive map and basemap.
- FastAPI and Uvicorn: HTTP API hosted on Render.
- Python, Requests, and Psycopg: data ingestion.
- PostgreSQL/PostGIS (Supabase) and Docker Compose: spatial database and local infrastructure.
- pnpm, Biome, and Ruff: dependency management, formatting, and linting.
- Vitest, React Testing Library, and pytest: unit tests and coverage; Cypress: e2e tests.
- GitHub Actions, Codecov, and Vercel: CI, coverage reporting, and deployment.

## AI usage

OpenAI Codex and Google Antigravity (Gemini) were used for code review,
ideation, test authoring, and data/infrastructure configuration. All
AI-assisted interventions were reviewed by the authors.

## Running tests

Run the frontend checks from the repository root after installing dependencies:

```sh
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm build:test
pnpm test:e2e
```

For the ETL, use **Python 3.12** in a virtual environment:

```sh
python -m pip install -r requirements-dev.txt
ruff check etl tests
python -m pytest -m "not integration" --cov=etl --cov-report=term-missing
```

ETL unit tests mock network and database access, while 4 additional PostGIS
integration tests (`python -m pytest -m integration`) validate `database/init.sql`,
idempotent upserts, and spatial queries against a real PostgreSQL/PostGIS
instance (configured via `DATABASE_URL` / Docker Compose and executed
automatically in CI). Both unit suites enforce **80%** minimum coverage; the
frontend checks lines, statements, functions, and branches.
The frontend HTML report is at `frontend/coverage/index.html`.
Cypress uses port **4173** and requires its
[system dependencies](https://docs.cypress.io/app/get-started/install-cypress#Linux-Prerequisites).
`build:test` targets a local API fixture on port **4174**, started automatically
by the E2E command. Fixtures are used only in tests.

| Suite | Unit tests | Integration tests | E2E tests |
| --- | ---: | ---: | ---: |
| Frontend | 147 | 0 | 61 |
| Backend | 21 | 0 | 0 |
| ETL / PostGIS | 20 | 4 | 0 |
| **Total** | **188** | **4** | **61** |

Counts include desktop and mobile test cases separately, without retries.

CI runs both suites on Linux, macOS, and Windows for PR updates and pushes to
`main`, uploading coverage to Codecov. The badges follow `main`.
