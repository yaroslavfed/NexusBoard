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

Код текущего Task API размещён в `services/work-management-service`.

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
  ├── WorkspaceMember
  └── Project? / standalone Project
       ├── ProjectMember
       └── Task

Task.projectId = null
  └── virtual Unassigned collection
```

Данные должны сохраняться в PostgreSQL и переживать restart приложения.

## Зафиксированные бизнес-решения

### Workspace

- [x] creator автоматически становится Workspace Owner
- [x] Workspace имеет `Active | Archived`
- [x] при archive выставляется `archivedAt`
- [x] Workspace может быть без Projects, если остаются members
- [x] Workspace без Projects и без members автоматически архивируется
- [x] archive и hard delete — разные операции
- [x] name уникален
- [x] `colorCategoryId` ссылается на отдельную color/category entity
- [x] `iconId` ссылается на metadata иконки; binary storage позже может быть S3-compatible

### Project

- [x] Project может иметь `workspaceId = null`
- [x] creator автоматически становится единственным Owner
- [x] роли Project: `Owner | Member | Observer`
- [x] Owner может передать ownership
- [x] при удалении Owner ownership получает oldest Member
- [x] если Member нет — oldest Observer
- [x] если других участников нет — Project архивируется
- [x] Project можно перемещать между Workspace
- [x] участники Project получают доступ к destination Workspace
- [x] Project имеет `Active | Archived` + `archivedAt`
- [x] имя уникально внутри Workspace
- [x] standalone Project names уникальны между standalone Projects
- [x] archive и hard delete — разные операции

### Task

- [x] `projectId` nullable
- [x] `projectId = null` означает Unassigned Task
- [x] `Unassigned` — virtual collection, а не реальный Project
- [x] статусы: `Todo | In Progress | Resolved | Closed | Rejected`
- [x] terminal states: `Closed | Rejected`
- [x] archive Project: `Resolved → Closed`
- [x] archive Project: `Todo/In Progress → Rejected`
- [x] `createdAt` immutable, `updatedAt` automatic
- [x] planned start/due dates
- [x] `completedAt` пока не вводится
- [x] отдельный lifecycle status `Active | Archived`
- [x] optimistic concurrency закладывается с Phase 2

### User history rule

- [x] deleted profile сохраняет прежний `userId`
- [x] status становится `Disabled`
- [x] в Profile сохраняются `userId` и ФИО
- [x] остальные персональные profile fields очищаются
- [x] credentials/sessions удаляются или отзываются в Auth
- [x] historical references сохраняются
- [x] повторная регистрация создаёт новый `userId`

## Пользовательский результат

- [ ] создать Workspace
- [ ] получить Workspace
- [ ] управлять Workspace members
- [ ] создать Project внутри Workspace
- [ ] создать standalone Project
- [ ] переместить Project между Workspace
- [ ] управлять Project members
- [ ] передать ownership
- [ ] создать Task внутри Project
- [ ] создать Unassigned Task
- [ ] назначить Unassigned Task в Project
- [ ] получить Tasks
- [ ] обновлять Task по state machine
- [ ] filtering/sorting/pagination
- [ ] archive Workspace/Project/Task
- [ ] отдельный hard delete contract без использования frontend по умолчанию
- [ ] persistence после restart

## Persistence и архитектура

- [ ] таблицы `workspace_color_categories`, `workspace_icons`, `workspaces`, `workspace_members`, `projects`, `project_members`, `tasks`
- [ ] PostgreSQL
- [ ] выбрать persistence approach для NestJS
- [ ] migrations
- [ ] FK/unique/check constraints
- [ ] partial unique index для standalone Project names
- [ ] indexes и composite indexes
- [ ] transactions для create + membership
- [ ] transaction для ownership transfer
- [ ] transaction для archive Project + Task finalization
- [ ] transaction для user-deletion ownership fallback
- [ ] optimistic locking для Task
- [ ] pagination
- [ ] PostgreSQL repository
- [ ] убрать in-memory repository из production path

## Практические темы

По необходимости: domain modelling/invariants, ORM vs domain model, raw SQL, connection pooling, EXPLAIN, isolation, row locking, optimistic locking, deadlocks, offset vs cursor pagination, advanced TypeScript.

## Проверка

- [ ] PostgreSQL integration tests/Testcontainers
- [ ] e2e Workspace → Project → Task
- [ ] e2e Unassigned → Project
- [ ] ownership transfer tests
- [ ] owner deletion fallback tests
- [ ] archive Project state-transition tests
- [ ] Workspace auto-archive test
- [ ] Project move/access recalculation test
- [ ] concurrency scenario для Task
- [ ] query plan нетривиального запроса

---

# Phase 3. Profiles, Auth, Sessions & Permissions

## Цель

Добавить полноценную пользовательскую identity и разделить понятия authentication и profile уже на уровне доменной модели, даже если до microservice split они ещё находятся в одном runtime.

### Profile

- [ ] User/Profile model
- [ ] fullName
- [ ] avatar metadata
- [ ] Active/Disabled
- [ ] deleted profile сохраняет `userId` + ФИО
- [ ] очистка остальных персональных profile fields

### Auth

- [ ] registration/login
- [ ] credentials
- [ ] password hashing
- [ ] access + refresh
- [ ] refresh rotation
- [ ] active sessions list
- [ ] revoke current/selected/all except current/all
- [ ] удаление/отзыв credentials и sessions при disable account

### Permissions

- [ ] Workspace membership
- [ ] Workspace Owner/Admin/Member
- [ ] Project Owner/Member/Observer
- [ ] permission checks

Практический фокус:

- Nest Guards
- custom decorators
- authentication vs profile boundary
- authorization/RBAC
- session lifecycle
- security boundaries
- secrets handling

---

# Phase 4. First Microservice Split + gRPC + GraphQL

## Цель

Разделить систему на первые самостоятельные runtime/bounded contexts:

```text
API Gateway
Auth Service
Profile Service
Work Management Service
```

Work Management Service сохраняет внутри себя:

```text
Workspace
WorkspaceMember
Project
ProjectMember
Task
Comment
```

Workspace/Project/Task не разносить на отдельные микросервисы только ради дробления: их business invariants пока требуют локальной транзакционной согласованности.

- [ ] отдельный runtime каждого сервиса
- [ ] database-per-service
- [ ] API Gateway
- [ ] Auth Service
- [ ] Profile Service
- [ ] Work Management Service
- [ ] Gateway → Auth по gRPC
- [ ] Gateway → Profile по gRPC
- [ ] Gateway → Work Management по gRPC
- [ ] Work Management → Profile lookup только там, где он действительно нужен
- [ ] no cross-service SQL
- [ ] no cross-service foreign keys
- [ ] stable `userId` в контрактах между Profile/Auth/Work Management

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
- [ ] aggregation Work Management + Profile + Notification
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

Развернуть Gateway/Auth/Profile/Work Management/Chat/Notification/Activity/Search и инфраструктуру.

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
