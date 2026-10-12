# Contributing to incore-studio

Start with the [IN-CORE developer guide](https://github.com/IN-CORE/.github/blob/main/DEVELOPING.md) (dev access, CORS, PR rules).

## Setup

Node (see `engines` in `package.json`).

```bash
npm install
npm run start:dev          # esbuild watch + serve on http://localhost:3000, → https://dev.in-core.org
```

Run on `localhost:3000` (or `:5000`) — the only origins dev allows via CORS. Pointing a local web client at prod (`tools.in-core.org`) will fail.

Backend URL comes from `INCORE_REMOTE_HOSTNAME` at build time (`esbuild.config.mjs`).
Local services: see [incore-services CONTRIBUTING](https://github.com/IN-CORE/incore-services/blob/develop/CONTRIBUTING.md#web-clients-incore-ui-studio-playbook-against-local-services). Workflows also need DataWolf; map layers need GeoServer.

## Commands

| Task | Command |
|------|---------|
| Build | `npm run build` |
| Test | `npm test` |
| Lint | `npm run lint` (`lint:fix` to fix) |
| Types | `npm run type-check` |

## Pull requests

Branch from `develop`, PR to `develop`, link the issue, update `CHANGELOG.md`, lint + type-check + tests pass.
