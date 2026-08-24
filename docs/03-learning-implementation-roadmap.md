# NexusBoard — Learning & Implementation Roadmap

## 1. Назначение

Этот документ определяет порядок развития NexusBoard и обучения внутри проекта.

Новый формат основан на **крупных продуктовых фазах**, а не на последовательности мелких упражнений по отдельным технологиям.

> Сначала выбирается законченный продуктовый сценарий, затем внутри него изучаются только реально нужные технологии и практические пробелы.

Известные темы используются сразу и не повторяются отдельными учебными этапами без необходимости.

---

## 2. Формат работы

Для каждой фазы:

1. формулируется пользовательский результат;
2. проектируется архитектура;
3. реализуется крупный вертикальный срез;
4. новые технологии разбираются по мере появления;
5. тесты добавляются вместе с функциональностью;
6. проверяются failure/concurrency scenarios;
7. выполняется code/architecture review.

Не используется схема «сначала намеренно сделать через неподходящий транспорт, потом переписать на правильный», если назначение целевого решения уже понятно.

---

## 3. Профиль обучения

### Использовать сразу без отдельного курса

- REST/HTTP;
- базовый SQL CRUD;
- обычные транзакции;
- базовые индексы;
- JWT/access/refresh/session management;
- unit/integration/e2e fundamentals;
- Docker Compose basics;
- modular monolith/service boundaries;
- RabbitMQ producer/consumer, ack/nack, idempotent consumer;
- protobuf basics.

### Усиливать практикой по ходу проекта

- advanced TypeScript;
- Node.js event loop/modules/streams/AbortController;
- NestJS Guards/Interceptors/Filters/decorators/providers;
- advanced PostgreSQL;
- Redis;
- NestJS gRPC;
- RabbitMQ delivery details;
- Outbox/Inbox implementation;
- resilience patterns;
- GraphQL;
- MongoDB advanced;
- Socket.IO/WebSocket;
- Search/Manticore;
- messaging/realtime/concurrency testing;
- Kubernetes/Helm;
- observability.

---

# Completed Foundation

## Stage 0. Project Setup — DONE

- [x] NestJS application
- [x] strict TypeScript
- [x] ESLint/Prettier
- [x] test setup
- [x] documentation structure

## Stage 1. TypeScript Fundamentals + Task API — DONE

- [x] Task domain model
- [x] in-memory repository
- [x] DI token
- [x] TaskService
- [x] REST CRUD
- [x] Zod validation
- [x] PATCH semantics
- [x] filtering/sorting
- [x] Swagger
- [x] unit tests
- [x] e2e tests
- [x] lint/build/tests green

Stage 1 считается завершённой базой. Дальше обучение не дробится на аналогичные микрозадачи.

---

# Phase 2. Core Product + PostgreSQL

## Цель

Превратить Task API в первую настоящую часть NexusBoard:

```text
Workspace
  └── Project
       └── Task
```

Данные должны сохраняться в PostgreSQL и переживать restart приложения.

## Пользовательский результат

- [ ] создать Workspace
- [ ] получить свои Workspace
- [ ] создать Project внутри Workspace
- [ ] получить Projects Workspace
- [ ] создать Task внутри Project
- [ ] получить Tasks Project
- [ ] обновлять Task
- [ ] filtering/sorting/pagination
- [ ] persistence после restart

## Persistence и архитектура

- [ ] спроектировать relations Workspace → Project → Task
- [ ] PostgreSQL
- [ ] выбрать persistence approach для NestJS
- [ ] migrations
- [ ] FK/unique/check constraints
- [ ] indexes и composite indexes
- [ ] pagination
- [ ] transactions
- [ ] PostgreSQL repository
- [ ] убрать in-memory repository из production path

## Практические темы

По необходимости:

- domain modelling и invariants
- ORM model vs domain model
- raw SQL
- connection pooling
- EXPLAIN / EXPLAIN ANALYZE
- isolation
- row locking
- optimistic locking
- deadlocks
- offset vs cursor pagination
- advanced TypeScript

## Проверка

- [ ] PostgreSQL integration tests/Testcontainers
- [ ] e2e Workspace → Project → Task
- [ ] concurrency scenario для Task
- [ ] query plan нетривиального запроса

---

# Phase 3. Users, Auth, Sessions & Permissions

## Цель

Добавить реального пользователя и связать его с Workspace.

- [ ] registration/login
- [ ] access + refresh
- [ ] refresh rotation
- [ ] active sessions list
- [ ] revoke current/selected/all except current/all
- [ ] Workspace membership
- [ ] Owner/Admin/Member
- [ ] permission checks

Практический фокус:

- Nest Guards
- custom decorators
- authorization/RBAC
- session lifecycle
- security boundaries
- secrets handling

---

# Phase 4. First Microservice Split + gRPC + GraphQL

## Цель

Разделить систему на:

```text
API Gateway
Auth Service
Project Service
```

- [ ] отдельный runtime каждого сервиса
- [ ] database-per-service
- [ ] API Gateway
- [ ] Gateway → Auth по gRPC
- [ ] Gateway → Project по gRPC
- [ ] no cross-service SQL

Не вводить промежуточный HTTP S2S только ради последующего переписывания.

### gRPC practice

- [ ] NestJS gRPC
- [ ] unary calls
- [ ] metadata
- [ ] deadlines
- [ ] error mapping
- [ ] protobuf compatibility/evolution
- [ ] streaming по подходящему сценарию

### GraphQL

- [ ] Workspace Dashboard
- [ ] resolver authorization
- [ ] DataLoader
- [ ] воспроизвести и исправить N+1

---

# Phase 5. Event-Driven Core + RabbitMQ + Outbox/Inbox

## Цель

Добавить асинхронные integration events сразу там, где они нужны.

- [ ] TaskCreated
- [ ] TaskAssigned
- [ ] TaskStatusChanged
- [ ] TaskCommented
- [ ] UserMentioned

Практический RabbitMQ-фокус:

- [ ] topology/routing
- [ ] prefetch
- [ ] competing consumers
- [ ] retry topology
- [ ] DLQ
- [ ] durability
- [ ] ordering limitations
- [ ] event contracts/versioning

Reliability:

- [ ] Transactional Outbox
- [ ] Outbox Worker
- [ ] cleanup
- [ ] idempotent consumers
- [ ] Inbox там, где нужна consumer-side atomicity
- [ ] duplicate delivery tests

---

# Phase 6. Chat + Socket.IO + MongoDB + Redis

## Цель

Реализовать полноценный realtime chat. Это один из главных практических блоков проекта.

### Chat Service

- [ ] Chat Room
- [ ] Chat Message
- [ ] MongoDB
- [ ] history/pagination
- [ ] indexes
- [ ] mentions
- [ ] aggregation query

### Socket.IO

- [ ] WebSocket basics
- [ ] Socket.IO lifecycle
- [ ] events
- [ ] rooms
- [ ] namespaces
- [ ] acknowledgements
- [ ] reconnect
- [ ] heartbeat
- [ ] authentication handshake
- [ ] room authorization
- [ ] typing
- [ ] presence
- [ ] delivery semantics

### Redis

- [ ] Pub/Sub
- [ ] Socket.IO Redis Adapter
- [ ] несколько Gateway instances
- [ ] horizontal scaling
- [ ] sticky sessions

Дополнительно по реальным сценариям: Cache Aside, TTL/invalidation, stampede, distributed locks, Streams, rate limiting.

---

# Phase 7. Notifications + Distributed Reliability Lab

## Notification Service

- [ ] отдельная PostgreSQL DB
- [ ] Task/Comment/Mention/Chat consumers
- [ ] Created/Delivered/Read
- [ ] mark as read
- [ ] realtime notifications

## Failure Lab

Намеренно проверить:

- [ ] consumer падает до ACK
- [ ] consumer падает после side effect до ACK
- [ ] duplicate event
- [ ] RabbitMQ unavailable
- [ ] gRPC timeout/unavailable
- [ ] PostgreSQL unavailable
- [ ] Redis unavailable
- [ ] concurrent Task update

Применить:

- [ ] retry
- [ ] exponential backoff
- [ ] jitter
- [ ] circuit breaker
- [ ] graceful degradation
- [ ] DLQ
- [ ] optimistic locking
- [ ] compensation

Saga — только если появляется реальный распределённый бизнес-процесс.

---

# Phase 8. Search Service + Manticore

## Цель

Единый полнотекстовый поиск по Projects, Tasks, Comments и Chat Messages.

- [ ] Manticore
- [ ] Search Service
- [ ] indexing events через RabbitMQ
- [ ] Tasks/Projects/Comments/Chat Messages
- [ ] full-text query
- [ ] type filters
- [ ] rebuild/reindex

Изучить на практике:

- [ ] inverted index
- [ ] tokenization
- [ ] relevance/ranking
- [ ] indexing pipeline
- [ ] search projection
- [ ] eventual consistency

---

# Phase 9. Observability + k3s + Helm + Operations

## Observability

- [ ] structured logs
- [ ] correlation ID
- [ ] trace ID
- [ ] OpenTelemetry
- [ ] spans/traces
- [ ] metrics
- [ ] Prometheus
- [ ] Grafana
- [ ] HTTP → Gateway → gRPC trace
- [ ] RabbitMQ processing trace

## k3s

Развернуть Gateway/Auth/Project/Chat/Notification/Search и инфраструктуру.

Практически изучить:

- [ ] Namespace
- [ ] Deployment
- [ ] Service
- [ ] Ingress
- [ ] ConfigMap
- [ ] Secret
- [ ] PVC
- [ ] StatefulSet
- [ ] Job/CronJob
- [ ] startup/readiness/liveness
- [ ] requests/limits

## Helm

- [ ] chart structure/templates/values
- [ ] dev configuration
- [ ] resources/probes/replicas
- [ ] install/upgrade/rollback

## Headlamp / Operations

- [ ] CrashLoopBackOff
- [ ] failing readiness
- [ ] bad configuration
- [ ] broken Service
- [ ] OOMKilled
- [ ] Pod recreation
- [ ] logs/events

---

# Phase 10. Final Architecture Review

- [ ] architecture diagram
- [ ] data ownership
- [ ] gRPC contracts
- [ ] event contracts
- [ ] retries/deadlines
- [ ] idempotency
- [ ] Outbox/Inbox
- [ ] session security
- [ ] realtime scaling
- [ ] search rebuild
- [ ] observability
- [ ] graceful degradation
- [ ] deployment
- [ ] актуализировать документацию

---

# Дополнительные темы

Не являются обязательными:

- [ ] Kafka
- [ ] Elasticsearch
- [ ] CQRS
- [ ] Event Sourcing
- [ ] OpenAPI client generation
- [ ] consumer-driven contract testing
- [ ] Feature Flags
- [ ] Service Mesh
- [ ] Chaos Engineering
- [ ] Kubernetes autoscaling
- [ ] Distributed scheduler

> Дополнительная технология появляется только если можно назвать конкретную проблему NexusBoard, которую она должна решить.
