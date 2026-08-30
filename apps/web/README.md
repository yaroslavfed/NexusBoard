# NexusBoard Web

NexusBoard Web is a Vue SPA and PWA. It communicates only with the public API Gateway and can be developed and
deployed independently of the monorepo.

## Requirements

- Node.js 22
- Yarn Classic 1.x

## Local development

```bash
yarn install
cp .env.example .env.local
yarn dev
```

`VITE_API_BASE_URL` defines the public API base URL. The default `/api` keeps browser requests same-origin, while
Vite proxies them to `VITE_API_GATEWAY_URL` only during local development. In production, set
`VITE_API_BASE_URL` to the public API Gateway URL or configure the web server to proxy `/api` to the gateway.

## Checks

```bash
yarn verify
```

The application currently has no automated test suite or separate lint configuration. Type checking and production
build are executed by `yarn verify`.

## Container image

```bash
docker compose up --build
```

The static application is available at `http://localhost:8080`.
