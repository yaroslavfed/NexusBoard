# NexusBoard

NexusBoard is a learning-oriented production-like backend project built with TypeScript, Node.js and NestJS.

The project evolves step by step from a simple NestJS application into a distributed microservice system.

The repository uses Yarn workspaces as a development orchestrator. Applications and services keep their own setup,
documentation and delivery configuration so they can be extracted into separate repositories without reorganising files.

## Documentation

- [Functional Specification](docs/01-functional-specification.md)
- [Technical Specification](docs/02-technical-specification.md)
- [Learning & Implementation Roadmap](docs/03-learning-implementation-roadmap.md)
- [Project Rules](docs/04-project-rules.md)

## Development in the monorepo

Install dependencies:

```bash
yarn install
```

Run all available checks:

```bash
yarn verify
```

Run a component from the monorepo:

```bash
yarn dev:work-management-service
yarn dev:web
```

For standalone setup and local dependencies, see the README files in
[`services/work-management-service`](services/work-management-service) and [`apps/web`](apps/web).
