# Work Management Service

Work Management Service owns the NexusBoard workspace, project, task and comment domain. It can be developed,
tested and deployed independently of the monorepo.

## Requirements

- Node.js 22
- Yarn Classic 1.x
- Docker Compose for the local PostgreSQL dependency

## Local development

Install dependencies and configure the service:

```bash
yarn install
cp .env.example .env
docker compose up -d
yarn migration:run
yarn start:dev
```

The service listens on `http://localhost:3000`. Swagger is available at `http://localhost:3000/api`.

## Checks

```bash
yarn verify
```

`yarn test:e2e` starts its own PostgreSQL Testcontainer and does not use the Compose database.

## Container image

```bash
docker build -t nexusboard-work-management-service .
```

Provide `DATABASE_URL` and `DEV_USER_ID` when starting the image. The database hostname must be reachable from the
container.
