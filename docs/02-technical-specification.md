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
          +---------------+------------------+
          |               |                  |
        Auth            Project             Chat
       Service           Service            Service
          |               |                  |
      PostgreSQL      PostgreSQL           MongoDB

                      RabbitMQ
          +---------------+------------------+
          |               |                  |
     Notification       Search            Activity
       Service          Service           Service
          |               |                  |
      PostgreSQL      Manticore           MongoDB

                       Redis
               +---------+----------+
               |                    |
              Cache          Socket.IO Pub/Sub
```

---

## 4. Сервисы

### 4.1. API Gateway

Ответственность:

- публичный REST API;
- публичный GraphQL API;
- Socket.IO connections;
- аутентификация входящих запросов;
- маршрутизация;
- aggregation read-моделей;
- преобразование transport DTO;
- вызов внутренних сервисов через gRPC.

Gateway не должен:

- владеть бизнес-данными;
- содержать доменную логику сервисов;
- обращаться напрямую к их БД.

### 4.2. Auth Service

Ответственность:

- пользователи;
- credentials;
- password hashing;
- login;
- JWT;
- refresh tokens;
- user sessions;
- revocation;
- управление активными устройствами.

Хранилище:

- PostgreSQL.

Минимальные таблицы:

- users;
- user_credentials;
- user_sessions.

### 4.3. Project Service

Ответственность:

- Workspace;
- memberships;
- projects;
- tasks;
- comments;
- task workflow;
- права на изменение проектных сущностей.

Хранилище:

- PostgreSQL.

Основные таблицы:

- workspaces;
- workspace_members;
- projects;
- tasks;
- comments;
- outbox_messages;
- inbox_messages при необходимости.

### 4.4. Chat Service

Ответственность:

- chat rooms;
- messages;
- message history;
- mentions;
- chat-specific operations.

Хранилище:

- MongoDB.

MongoDB выбирается из-за естественной документной модели сообщений и удобной работы с историей, вложенными данными и меняющейся структурой message metadata.

### 4.5. Notification Service

Ответственность:

- создание уведомлений;
- хранение их состояния;
- получение событий через RabbitMQ;
- mark as read;
- подготовка пользовательских realtime notifications.

Хранилище:

- PostgreSQL.

### 4.6. Activity Service

Ответственность:

- immutable activity stream;
- события действий пользователей;
- история значимых изменений.

Хранилище:

- MongoDB.

### 4.7. Search Service

Ответственность:

- индексация searchable entities;
- обработка integration events;
- полнотекстовый поиск;
- фильтрация результатов;
- rebuild индекса.

Search engine:

- Manticore Search.

Возможное дополнительное упражнение после основной реализации:

- сравнение с Elasticsearch.

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
- Gateway -> Project;
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
Project Service
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
- unique constraints;
- indexes;
- transactions;
- optimistic locking при конкурентных изменениях;
- pagination;
- query analysis.

---

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

- projects;
- tasks;
- comments;
- chat messages.

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
