# NexusBoard — Technical Specification

## 1. Назначение документа

Этот документ описывает **как должен быть устроен NexusBoard технически**.

Он является основным источником истины по:

- архитектуре;
- ответственности сервисов;
- протоколам взаимодействия;
- хранилищам данных;
- инфраструктуре;
- интеграционным подходам;
- требованиям к отказоустойчивости.

Функциональность системы описана отдельно в `01-functional-specification.md`.

---

## 2. Общая архитектурная цель

Финальная система строится как набор независимых NestJS-микросервисов. При этом проект развивается крупными продуктовыми фазами: знакомые концепции не повторяются отдельными учебными блоками, а слабые и новые технологии изучаются внутри реальных сценариев.

Основные принципы:

- клиент взаимодействует только с API Gateway;
- синхронное S2S-взаимодействие выполняется преимущественно через gRPC;
- асинхронное взаимодействие выполняется через RabbitMQ;
- каждый сервис владеет собственными данными;
- прямой доступ к БД другого сервиса запрещён;
- для realtime используется Socket.IO;
- Redis применяется отдельно как cache и как Pub/Sub transport для Socket.IO;
- полнотекстовый поиск реализуется через отдельный search engine;
- deployment выполняется в k3s;
- инфраструктура описывается Helm charts.

### 2.1. Структура репозитория

Репозиторий организован как Yarn monorepo:

```text
apps/       # Самостоятельные публичные приложения
services/   # Независимые backend-сервисы
packages/   # Версионируемые пакеты интеграционных контрактов и инфраструктурных библиотек
infra/      # Docker, Kubernetes и Helm-описания
```

Текущая реализация Task API находится в `services/work-management-service`. Пока API Gateway не создан,
Task API запускается напрямую. В процессе Phase 2 эта реализация эволюционирует в домен Work Management.
При первом microservice split публичный HTTP transport будет вынесен в API Gateway, а Workspace/Project/Task/Comment
и связанные business invariants останутся внутри Work Management Service.

### 2.2. Границы сервисов и приложений

Каждый сервис владеет своим кодом, конфигурацией, миграциями и тестами. Внутри `src` код задачи
разделяется на `domain`, `application`, `infrastructure` и transport-слой.

Сервисы и приложения не импортируют внутренний код друг друга. В частности, запрещены зависимости
вида `work-management-service -> ../../profile-service/src/...` и импорт application/domain services в API Gateway.

Взаимодействие между сервисами выполняется только через явные HTTP API, gRPC или integration events.
Web-клиент использует публичные API и не импортирует domain-модели backend-сервисов.

`packages` не является папкой для общего прикладного кода. Domain-модели и бизнес-логика сервисов
не выносятся в пакеты. Пакет допускается, только если он может развиваться и устанавливаться как
отдельный npm package. Например, `@nexusboard/contracts`, `@nexusboard/logger`,
`@nexusboard/telemetry` или `@nexusboard/testing`.

`@nexusboard/contracts` содержит только версионируемые межсервисные контракты, такие как `.proto`
файлы и event schemas. Он не содержит реализации сервисов и не является runtime-компонентом.

---

## 3. Целевая схема

```text
                              Client
                                |
                    REST / GraphQL / Socket.IO
                                |
                           API Gateway
                                |
                               gRPC
          +---------------------+----------------------+
          |                     |                      |
        Auth                 Profile            Work Management
       Service               Service                Service
          |                     |                      |
      PostgreSQL            PostgreSQL             PostgreSQL
                                                    |
                                           Workspace / Project
                                             Task / Comment

                               |
                              Chat
                             Service
                               |
                             MongoDB


                         RabbitMQ / Events
          +---------------------+----------------------+
          |                     |                      |
   Notification             Activity                Search
      Service               Service                Service
          |                     |                      |
      PostgreSQL            MongoDB               Manticore


                              Redis
                    +-----------+------------+
                    |                        |
                  Cache              Socket.IO Pub/Sub
```

Ключевой принцип разделения:

- `Auth Service` отвечает за authentication, credentials и sessions;
- `Profile Service` владеет пользовательским профилем и lifecycle пользовательской identity;
- `Work Management Service` владеет Workspace, Project, Task и Comment как одним транзакционно связанным доменом;
- `Chat Service` владеет realtime communication domain;
- `Notification`, `Activity` и `Search` строят собственные модели преимущественно из integration events;
- API Gateway скрывает внутреннее разбиение от frontend.

---

## 4. Сервисы

### 4.1. API Gateway

Ответственность:

- единая публичная точка входа;
- публичный REST API;
- публичный GraphQL API;
- Socket.IO connections;
- authentication/authorization boundary для входящих клиентских запросов;
- маршрутизация;
- aggregation read-моделей;
- преобразование transport DTO;
- вызов внутренних сервисов через gRPC.

Gateway не должен:

- владеть бизнес-данными;
- содержать доменную логику сервисов;
- обращаться напрямую к их БД;
- превращаться в общий business service.

### 4.2. Auth Service

Auth Service отвечает только за authentication и lifecycle авторизованных сессий.

Ответственность:

- registration flow в части credentials;
- login;
- password hashing;
- access tokens;
- refresh tokens;
- refresh token rotation;
- user sessions;
- revocation;
- управление активными устройствами;
- проверка authentication identity.

Auth Service не владеет пользовательским профилем, Workspace/Project membership или display-данными.

Хранилище:

- PostgreSQL.

Минимальные таблицы:

- auth_identities или эквивалентная identity mapping;
- user_credentials;
- user_sessions.

`userId` является стабильным идентификатором пользователя и связывает authentication identity с Profile Service.

### 4.3. Profile Service

Profile Service владеет пользовательской identity с точки зрения продукта.

Ответственность:

- User/Profile;
- ФИО;
- display name при необходимости;
- avatar metadata;
- profile status;
- пользовательские profile settings;
- timezone/locale/preferences по мере появления;
- deleted/disabled profile representation.

Хранилище:

- PostgreSQL.

Минимальная таблица:

- users или profiles.

При удалении аккаунта:

- `userId` сохраняется;
- profile status становится `Disabled`;
- сохраняются `userId` и ФИО;
- остальные персональные profile fields очищаются;
- avatar заменяется на Deleted User placeholder;
- повторная регистрация создаёт новый `userId`.

Credentials и sessions удаляются/отзываются в Auth Service.

Profile Service не владеет WorkspaceMember/ProjectMember: эти связи принадлежат Work Management domain.

### 4.4. Work Management Service

Work Management Service владеет доменом организации командной работы.

Ответственность:

- Workspace;
- Workspace membership;
- Project;
- Project membership и ownership;
- Task;
- Comment;
- Task workflow/state machine;
- Task lifecycle `Active | Archived`;
- `Unassigned` projection для Tasks с `projectId = null`;
- archive/hard-delete semantics;
- перемещение Project между Workspace;
- автоматическая передача Project ownership;
- права на изменение Workspace/Project/Task/Comment;
- транзакционные invariants между Workspace, Project и Task.

Хранилище:

- PostgreSQL.

Основные таблицы:

- workspace_color_categories;
- workspace_icons;
- workspaces;
- workspace_members;
- projects;
- project_members;
- tasks;
- comments;
- outbox_messages;
- inbox_messages при необходимости.

Ключевые технические инварианты:

- `projects.workspace_id` nullable;
- `tasks.project_id` nullable;
- `Unassigned` не хранится как Project;
- creator Workspace/Project автоматически получает соответствующее membership;
- Project ownership transfer выполняется атомарно;
- архивирование Project атомарно меняет Project и финализирует/архивирует его Tasks;
- terminal workflow states (`Closed`, `Rejected`) не изменяются;
- Task lifecycle status хранится отдельно от workflow status;
- optimistic concurrency для Task поддерживается через version-поле или эквивалентный механизм.

Workspace, Project и Task намеренно не разделяются на отдельные микросервисы на текущей целевой границе. Между ними существуют сильные транзакционные invariants, и разбиение породило бы distributed consistency без достаточной выгоды.

### 4.5. Chat Service

Ответственность:

- chat rooms;
- chat memberships при необходимости;
- messages;
- message history;
- mentions;
- attachments metadata;
- chat-specific operations;
- realtime communication scenarios.

Хранилище:

- MongoDB.

### 4.6. Notification Service

Ответственность:

- создание уведомлений;
- хранение их состояния;
- получение integration events через RabbitMQ;
- mark as read;
- подготовка пользовательских realtime notifications.

Хранилище:

- PostgreSQL.

Notification Service не участвует в основной транзакции Work Management/Chat операции.

### 4.7. Activity Service

Ответственность:

- immutable activity stream;
- пользовательская история значимых действий;
- события Workspace/Project/Task/Comment;
- события Chat/Profile/Auth, если они имеют продуктовый смысл.

Хранилище:

- MongoDB.

Activity Service не является Event Store и не используется для восстановления domain state.

### 4.8. Search Service

Ответственность:

- индексация searchable entities;
- обработка integration events;
- полнотекстовый поиск;
- фильтрация результатов;
- rebuild индекса.

Search engine:

- Manticore Search.

Источники данных:

- Work Management Service;
- Chat Service;
- Profile Service при необходимости поиска пользователей.

Search index является производной моделью и не является source of truth.

### 4.9. Основные связи между сервисами

Синхронные связи через gRPC используются только когда вызывающей стороне действительно нужен немедленный ответ.

```text
API Gateway -> Auth
API Gateway -> Profile
API Gateway -> Work Management
API Gateway -> Chat
API Gateway -> Notification
```

Внутренний sync lookup допускается, например:

```text
Work Management -> Profile
Chat -> Profile
```

только если операция действительно требует актуальных profile данных и local projection не подходит.

Асинхронные связи:

```text
Auth / Profile / Work Management / Chat
                  |
              RabbitMQ
           /       |       \
Notification   Activity   Search
```

Примеры integration events:

```text
TaskAssigned
TaskStatusChanged
ProjectArchived
ProjectOwnershipTransferred
CommentCreated
ChatMessageCreated
UserProfileDisabled
UserSessionRevoked
```

---

## 5. API

### 5.1. REST

REST используется преимущественно для:

- command-like операций;
- CRUD;
- auth endpoints;
- простых resource-oriented запросов.

Примеры:

```text
POST   /auth/login
POST   /auth/refresh
POST   /tasks
PATCH  /tasks/:id
DELETE /tasks/:id
POST   /sessions/:id/revoke
```

### 5.2. GraphQL

GraphQL применяется там, где клиенту требуется составное read-представление из нескольких источников.

Основной пример:

```graphql
query {
  workspace(id: "...") {
    name
    projects {
      name
      tasks {
        title
        status
        assignee {
          id
          name
        }
      }
    }
    currentUser {
      notifications {
        id
        text
      }
    }
  }
}
```

GraphQL не должен дублировать весь REST API без причины.

---

## 6. S2S взаимодействие

### 6.1. gRPC

gRPC используется для синхронных запросов между сервисами.

Примеры:

- Gateway -> Auth;
- Gateway -> Profile;
- Gateway -> Work Management;
- Gateway -> Chat;
- Gateway -> Notification;
- внутренние lookup-запросы, если они действительно требуют синхронного ответа.

Требования:

- contracts описываются в `.proto`;
- transport contract не должен автоматически совпадать с domain entity;
- должны использоваться deadlines;
- ошибки должны преобразовываться в согласованный contract;
- контракты должны эволюционировать обратно совместимо.

### 6.2. RabbitMQ

RabbitMQ используется для асинхронного event-driven взаимодействия.

Примеры событий:

```text
TaskCreated
TaskAssigned
TaskStatusChanged
TaskCommented
UserMentioned
ChatMessageCreated
UserSessionRevoked
```

Пример:

```text
Work Management Service
      |
  TaskAssigned
      |
   RabbitMQ
   /   |    \
  /    |     \
Notification Search Activity
```

---

## 7. Events

### Domain Event

Событие внутри доменной модели.

Пример:

```text
TaskAssigned
```

### Integration Event

Внешний контракт, который публикуется другим сервисам.

Не каждый domain event обязан становиться integration event.

Integration event должен быть:

- стабильным;
- сериализуемым;
- versionable;
- независимым от внутренней domain entity.

---

## 8. Надёжная доставка сообщений

Нельзя полагаться на последовательность:

```ts
await repository.save(task);
await rabbit.publish(event);
```

потому что процесс может завершиться между двумя операциями.

Для критичных изменений применяется Transactional Outbox.

Поток:

```text
DB transaction
   |
   +-- UPDATE domain data
   |
   +-- INSERT outbox event
   |
 COMMIT
   |
 Outbox Worker
   |
 RabbitMQ
```

Для consumer side предусматривается idempotency и при необходимости Transactional Inbox.

---

## 9. Delivery semantics

Базовое допущение системы:

> доставка через RabbitMQ рассматривается как at-least-once.

Следствия:

- consumer должен выдерживать повторную доставку;
- duplicate events являются нормальной ситуацией;
- exactly-once не считается гарантией транспортного уровня;
- side effects должны быть idempotent.

---

## 10. Auth и JWT

Используются:

- short-lived access token;
- long-lived refresh token;
- отдельная session на устройство;
- refresh token rotation;
- возможность server-side revocation.

Сессия должна иметь собственный идентификатор.

Рекомендуемые JWT claims:

- `sub` — user id;
- `sid` — session id;
- `jti` — token id;
- `iat`;
- `exp`.

Refresh token не должен храниться в БД в открытом виде.

---

## 11. Управление сессиями

Поддерживаются операции:

```text
revoke current session
revoke selected session
revoke all except current
revoke all
```

Хранимые данные:

- session id;
- user id;
- device/client metadata;
- refresh token hash;
- created at;
- last activity;
- expires at;
- revoked at.

---

## 12. Redis

Redis используется в двух разных ролях.

### 12.1. Cache

Use cases:

- часто запрашиваемые данные;
- expensive read model;
- временные lookup-данные.

Основной подход:

- Cache Aside.

Обязательные темы:

- TTL;
- invalidation;
- stale cache;
- cache stampede;
- race conditions;
- distributed locking при необходимости.

### 12.2. Pub/Sub

Redis Pub/Sub используется для горизонтального масштабирования Socket.IO Gateway через Redis Adapter.

Пример:

```text
Gateway #1
Gateway #2
Gateway #3
     \    |    /
      Redis Pub/Sub
```

---

## 13. Socket.IO

Socket.IO используется для:

- chat messages;
- notifications;
- task updates;
- typing;
- presence.

Обязательные аспекты:

- authentication during handshake;
- rooms;
- namespaces только при необходимости;
- reconnect;
- event acknowledgements;
- connection lifecycle;
- горизонтальное масштабирование через Redis Adapter.

---

## 14. PostgreSQL

PostgreSQL используется для транзакционно важных структурированных данных.

Основные требования:

- migrations;
- foreign keys;
- unique/check constraints;
- indexes и composite indexes;
- transactions;
- isolation;
- optimistic locking при конкурентных изменениях;
- pagination;
- connection pooling;
- query analysis через `EXPLAIN / EXPLAIN ANALYZE`.

### 14.1. Core relational model Phase 2

В текущем monolith/Phase 2 минимальная схема может содержать:

```text
users
workspace_color_categories
workspace_icons
workspaces
workspace_members
projects
project_members
tasks
```

После первого microservice split:

- `users/profiles` принадлежат Profile Service;
- Work Management Service хранит только `userId` в membership/author/assignee references и не выполняет cross-service foreign key.

Ключевые связи:

```text
Workspace 1 ── N WorkspaceMember(userId)
Workspace 1 ── N Project                (Project.workspaceId nullable)
Project   1 ── N ProjectMember(userId)
Project   1 ── N Task                   (Task.projectId nullable)

Profile Service
User/Profile(id)
     ↑
     └── логические ссылки по userId из Work Management, без cross-service FK после split
```

`projectId = null` означает Unassigned Task.

### 14.2. Workspace constraints

- `name` уникален;
- `color_category_id` nullable и ссылается на отдельную color/category entity;
- `icon_id` nullable и ссылается на metadata записи иконки;
- binary content иконки в будущем может храниться в S3-compatible object storage, БД хранит только metadata/storage key;
- `status` принимает `Active | Archived`;
- `archived_at` nullable;
- creator membership создаётся в той же business operation;
- при отсутствии и Projects, и members Workspace автоматически архивируется;
- отсутствие Projects само по себе не является причиной архивирования, если members остаются.

### 14.3. Project constraints

- `workspace_id` nullable;
- `status: Active | Archived`;
- `archived_at` nullable;
- creator автоматически получает `ProjectMember(role = Owner)`;
- внутри одного Workspace имя Project уникально;
- standalone Project names также уникальны между standalone Projects;
- одинаковые имена допустимы в разных Workspace.

Для PostgreSQL обычного `UNIQUE(workspace_id, name)` недостаточно для standalone Projects, потому что `NULL` не конфликтует с `NULL`. Для standalone case нужен отдельный partial unique index или эквивалентное решение.

### 14.4. Project membership and ownership

`project_members` хранит минимум:

- `project_id`;
- `user_id`;
- `role: Owner | Member | Observer`;
- `joined_at`.

Правила:

- у активного Project в нормальном пользовательском состоянии один Owner;
- ручная передача ownership: новый Owner назначается, старый становится Member в одной транзакции;
- при удалении Owner новый Owner выбирается по `joined_at ASC`: сначала среди Member, затем среди Observer;
- если других участников нет, Project архивируется;
- если Project перемещается между Workspace, участникам обеспечивается доступ к destination Workspace, а доступ к source Workspace пересчитывается.

Способ хранения происхождения Workspace membership не является внешним контрактом. Реализация должна лишь корректно поддерживать явно выданный Workspace-доступ и доступ, возникающий через Project.

### 14.5. Task state machine

Task statuses:

```text
Todo
In Progress
Resolved
Closed
Rejected
```

Допустимые ручные переходы:

```text
Todo        → In Progress | Resolved | Rejected
In Progress → Resolved | Rejected
Resolved    → In Progress | Closed
Closed      → terminal
Rejected    → terminal
```

При archive Project:

```text
Resolved    → Closed
Todo        → Rejected
In Progress → Rejected
```

`Closed` и `Rejected` после перехода не редактируются.

Отдельно от workflow status Task имеет lifecycle status:

```text
Active
Archived
```

При archive Project его Tasks переводятся в lifecycle `Archived` в той же business operation. Workflow при этом меняется по правилам выше.

Task хранит immutable `created_at`, automatic `updated_at`, optional `start_date`, optional `due_date` и `version` для optimistic concurrency. `completedAt` на текущем этапе не вводится.

### 14.6. Archive vs hard delete

Archive и hard delete являются разными operations.

Archive сохраняет строку, меняет status, выставляет `archived_at` и может запускать domain side effects.

Hard delete физически удаляет данные, вызывается отдельной operation/endpoint и не должен использоваться обычным frontend flow. В будущем он может быть ограничен administrative permission.

`DELETE` не должен неявно означать то archive, то hard delete в зависимости от контекста.


## 15. MongoDB

MongoDB используется там, где документная модель имеет практический смысл.

Основные use cases:

- chat messages;
- activity stream.

Обязательные темы:

- embedding vs references;
- document growth;
- indexes;
- aggregation pipeline;
- pagination;
- consistency model.

---

## 16. Search

Для полнотекстового поиска используется Manticore Search.

Индексируются:

- workspaces при необходимости;
- projects;
- tasks;
- comments;
- chat messages;
- profiles/users при появлении пользовательского поиска.

Основной поток:

```text
Domain Service
    |
Integration Event
    |
RabbitMQ
    |
Search Service
    |
Manticore
```

Search index является производной моделью.

Источник истины — БД сервисов-владельцев.

Должен существовать механизм полного rebuild индекса.

---

## 17. Ошибки и resilience

Система должна учитывать:

- network timeout;
- временную недоступность сервиса;
- повторную доставку события;
- падение consumer;
- зависший gRPC call;
- частичную деградацию.

Применяемые подходы по мере необходимости:

- timeout;
- deadline;
- retry;
- exponential backoff;
- jitter;
- circuit breaker;
- DLQ;
- idempotency;
- optimistic concurrency;
- graceful degradation.

---

## 18. Saga

Saga рассматривается только для действительно распределённых бизнес-процессов, где одна операция затрагивает несколько сервисов и требует согласованного состояния.

Оба подхода должны быть изучены:

- choreography;
- orchestration.

Saga не применяется к простой операции только ради демонстрации паттерна.

---

## 19. Observability

В систему должны быть постепенно добавлены:

- structured logging;
- correlation id;
- trace id;
- OpenTelemetry;
- metrics;
- Prometheus;
- Grafana;
- distributed tracing.

Один пользовательский запрос должен быть прослеживаем между сервисами.

---

## 20. Локальный запуск

На промежуточных этапах сервисы запускаются локально.

Инфраструктурные зависимости допускается поднимать через Docker Compose:

- PostgreSQL;
- MongoDB;
- RabbitMQ;
- Redis;
- Manticore.

Kubernetes не является обязательным на ранних этапах.

---

## 21. Kubernetes

Финальное окружение:

- k3s.

Обязательные Kubernetes-сущности:

- Namespace;
- Deployment;
- Service;
- Ingress;
- ConfigMap;
- Secret;
- PVC;
- StatefulSet;
- Job;
- CronJob по необходимости.

---

## 22. Helm

Deployment сервисов описывается Helm charts.

Обязательные темы:

- templates;
- values;
- environments;
- reusable configuration;
- secrets handling;
- resource limits;
- replicas;
- probes.

---

## 23. Health checks

Для сервисов должны использоваться:

- startupProbe;
- readinessProbe;
- livenessProbe.

Нужно понимать различие между ними и последствия неправильной настройки.

---

## 24. Headlamp

Headlamp используется как UI для работы с k3s.

Через него должны изучаться:

- Pods;
- Deployments;
- Services;
- logs;
- events;
- ConfigMaps;
- Secrets;
- PVC;
- replica state.

---

## 25. Тестирование

Тестирование является частью каждой продуктовой фазы, а не отдельным учебным этапом.

Используются:

- Jest;
- unit tests;
- integration tests;
- e2e tests;
- Testcontainers.

Основные уровни:

```text
Unit
Integration
E2E
Contract tests
```

Контрактные тесты добавляются при появлении межсервисных контрактов.

---

## 26. Принцип эволюции

Проект не создаётся сразу в финальной архитектуре, но и не обязан проходить через искусственно плохие промежуточные решения.

Основной цикл:

```text
выбрать продуктовый сценарий
    ↓
спроектировать подходящую архитектуру
    ↓
реализовать вертикальный срез
    ↓
разобрать новые технологии и практические пробелы
    ↓
проверить failure/concurrency scenarios
    ↓
review и cleanup
```

Если назначение RabbitMQ, gRPC, Outbox или другого подхода уже понятно и текущий сценарий действительно его требует, не нужно сначала реализовывать заведомо неподходящий HTTP/dual-write вариант только ради последующего переписывания.

Сложность всё равно вводится только при наличии конкретной задачи и понятной цены.

---

## 27. Что намеренно не вводится раньше времени

Не добавляются без реальной необходимости:

- Kafka;
- Kubernetes;
- Saga;
- CQRS;
- Event Sourcing;
- service mesh;
- Kubernetes Operators;
- отдельный Config Server;
- сложная IAM-система;
- несколько search engines одновременно.

Такие технологии могут появляться только как следующий учебный этап, если текущая система создаёт понятную проблему, которую они решают.
