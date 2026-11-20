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

The current frontend offers search and neighborhood filters using fictional
demo places, with English (default) and Portuguese interfaces.

## Technologies

- Next.js, React, and TypeScript: application and interface.
- Tailwind CSS and Lucide: styling and icons.
- next-intl: English and Portuguese translations.
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

Open <http://localhost:3000/en> or <http://localhost:3000/pt>.
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
To activate Codecov, enable the repository in Codecov and set the GitHub Actions
variable `CODECOV_ENABLED=true`. The coverage badge follows `main`.

## Deployment

On Vercel, select `frontend` as the Root Directory and enable access to files
outside it for the pnpm workspace. Use `pnpm install --frozen-lockfile` and
`pnpm build`; set `CYPRESS_INSTALL_BINARY=0` in the build environment.

Hero photo: [KC Shum / Unsplash](https://unsplash.com/photos/jwowyIij6ss).
