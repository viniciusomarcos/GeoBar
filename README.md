# GeoBar

[![Frontend main](https://github.com/viniciusomarcos/GeoBar/actions/workflows/frontend-main.yml/badge.svg?branch=main)](https://github.com/viniciusomarcos/GeoBar/actions/workflows/frontend-main.yml)
[![Frontend coverage](https://codecov.io/gh/viniciusomarcos/GeoBar/branch/main/graph/badge.svg?flag=frontend)](https://codecov.io/gh/viniciusomarcos/GeoBar)

## Team members

- Alessandro Mesa Teppa
- Lucas Paulo Martins Mariz
- Vinícius de Oliveira Marcos

## About the system

GeoBar helps users discover bars in Belo Horizonte. Developed for Software
Engineering II at UFMG, it is inspired by
[this computational geometry project](https://github.com/amt-cc/tp1-geometria-computacional).

The frontend offers bar search, neighborhood filters, an interactive map, and
bar details using demo data, with Portuguese (default) and English interfaces.
Language and light/dark theme preferences are saved in the browser.

## Technologies

- Next.js, React, and TypeScript: application and interface.
- Tailwind CSS and Lucide: styling and icons.
- next-intl: English and Portuguese translations.
- Leaflet and OpenStreetMap: interactive map and basemap.
- pnpm and Biome: dependency management, linting, and formatting.
- Vitest and React Testing Library: unit tests and coverage; Cypress: e2e tests.
- GitHub Actions and Codecov: CI and coverage reporting.
- PostgreSQL/PostGIS and Docker Compose: database foundation.

## AI usage

OpenAI Codex was used for code review, idea generation, and infrastructure
configuration. All AI-assisted interventions were reviewed by the authors.

## Getting started

Requirements: Node.js **24.x** and pnpm **10.33.4**. From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm start
```

Open <http://localhost:3000>.
For production, run `pnpm build` followed by `pnpm start:prod`.

## Running tests

From the repository root:

```sh
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm build
pnpm test:e2e
```

Unit test coverage must reach **80%** for lines, statements, functions, and
branches. The HTML report is at `frontend/coverage/index.html`.
Cypress uses port **4173** and requires its
[system dependencies](https://docs.cypress.io/app/get-started/install-cypress#Linux-Prerequisites).

CI runs on PR updates and pushes to `main`, on Linux, macOS, and Windows.
Coverage uploads to Codecov automatically; enable the repository in Codecov.
The coverage badge follows `main`.

## Deployment

Production (`main`): [geo-bar.vercel.app](https://geo-bar.vercel.app).


Hero photo: [KC Shum / Unsplash](https://unsplash.com/photos/jwowyIij6ss).
