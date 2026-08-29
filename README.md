# NexusBoard

NexusBoard is a learning-oriented production-like backend project built with TypeScript, Node.js and NestJS.

The project evolves step by step from a simple NestJS application into a distributed microservice system.

The repository uses Yarn workspaces. The current implementation lives in
[`services/work-management-service`](services/work-management-service); future applications, services and versioned packages
have dedicated top-level directories.

## Documentation

- [Functional Specification](docs/01-functional-specification.md)
- [Technical Specification](docs/02-technical-specification.md)
- [Learning & Implementation Roadmap](docs/03-learning-implementation-roadmap.md)
- [Project Rules](docs/04-project-rules.md)

## Development

Install dependencies:

```bash
yarn install
```

Start the current service:

```bash
yarn start:dev
```

For the PostgreSQL foundation, start the local database with `docker compose -f infra/docker-compose.yml up -d`, copy `.env.example` in the Work Management service, and run `yarn workspace @nexusboard/work-management-service migration:run`.
