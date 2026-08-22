# NexusBoard — Learning & Implementation Roadmap

## 1. Назначение

Этот документ определяет **порядок обучения и развития проекта**.

Его задача:

- не перескакивать через фундамент;
- не внедрять технологии раньше необходимости;
- фиксировать прогресс;
- понимать, что изучать дальше;
- разделять развитие продукта на логические этапы.

Правило:

> Следующий этап начинается только после понимания ключевых тем текущего этапа и завершения его обязательных задач.

---

# Stage 0. Подготовка проекта

Цель: подготовить минимальную основу без преждевременной архитектуры.

- [ ] Создать repository.
- [ ] Создать NestJS application.
- [ ] Настроить TypeScript.
- [ ] Настроить ESLint.
- [ ] Настроить Prettier или согласованный formatter.
- [ ] Включить `strict`.
- [ ] Настроить unit test runner.
- [ ] Создать минимальный README.
- [ ] Зафиксировать структуру документации.
- [ ] Убедиться, что проект запускается локально.

Результат:

- чистый NestJS-проект;
- отсутствует БД;
- отсутствуют Docker, RabbitMQ, Redis, gRPC и Kubernetes.

---

# Stage 1. TypeScript Fundamentals + Task API

Цель: уверенно писать базовый TypeScript-код и понимать NestJS request flow.

Функциональность:

- [ ] `POST /tasks`
- [ ] `GET /tasks`
- [ ] `GET /tasks/:id`
- [ ] `PATCH /tasks/:id`
- [ ] `DELETE /tasks/:id`
- [ ] In-memory Task storage через `Map`.

TypeScript:

- [ ] primitives;
- [ ] object types;
- [ ] arrays;
- [ ] tuples;
- [ ] interface;
- [ ] type;
- [ ] class;
- [ ] enum;
- [ ] literal types;
- [ ] union types;
- [ ] optional properties;
- [ ] readonly;
- [ ] destructuring;
- [ ] spread;
- [ ] `Map`;
- [ ] `Set`;
- [ ] `Record`;
- [ ] `Partial`;
- [ ] `Pick`;
- [ ] `Omit`;
- [ ] `Object.keys`;
- [ ] `Object.values`;
- [ ] `Object.entries`;
- [ ] template literals;
- [ ] narrowing;
- [ ] `unknown`;
- [ ] `never`.

NestJS:

- [ ] Controller.
- [ ] Service.
- [ ] Module.
- [ ] Provider.
- [ ] Dependency Injection.
- [ ] DTO.
- [ ] Pipe.
- [ ] Exception Filter.
- [ ] Guard.
- [ ] Interceptor.

Контрольная точка:

- [ ] Могу объяснить разницу `type` и `interface`.
- [ ] Могу объяснить `unknown` vs `any`.
- [ ] Могу объяснить зачем NestJS DI.
- [ ] Могу объяснить ответственность Controller и Service.
- [ ] Не использую `any` для обхода ошибок.

---

# Stage 2. Domain Modelling

Цель: перейти от CRUD-мышления к моделированию поведения.

Добавить:

- [ ] User.
- [ ] Workspace.
- [ ] Project.
- [ ] Task.
- [ ] Comment.

Изучить:

- [ ] entity;
- [ ] value object;
- [ ] invariants;
- [ ] encapsulation;
- [ ] immutability;
- [ ] domain errors;
- [ ] state transitions;
- [ ] discriminated unions;
- [ ] composition over inheritance.

Практика:

- [ ] Реализовать контролируемую смену Task status.
- [ ] Запретить невалидные переходы.
- [ ] Убрать прямое изменение важных полей там, где нужны invariants.
- [ ] Сделать явные domain errors.
- [ ] Вернуть часть результатов через discriminated union.

Контрольная точка:

- [ ] Могу объяснить, почему entity не равна DTO.
- [ ] Могу объяснить, когда class оправдан.
- [ ] Понимаю отличие данных от поведения.

---

# Stage 3. PostgreSQL Persistence

Цель: заменить in-memory storage на реальное хранилище.

- [ ] Поднять PostgreSQL.
- [ ] Подключить ORM.
- [ ] Создать migrations.
- [ ] Создать таблицы.
- [ ] Реализовать persistence для Task.
- [ ] Реализовать persistence для Project.
- [ ] Реализовать persistence для Workspace.
- [ ] Реализовать persistence для Comment.
- [ ] Добавить constraints.
- [ ] Добавить indexes.
- [ ] Добавить pagination.
- [ ] Добавить transactions.

Изучить:

- [ ] migration lifecycle;
- [ ] transaction boundary;
- [ ] foreign key;
- [ ] unique constraint;
- [ ] index;
- [ ] N+1;
- [ ] pagination;
- [ ] repository abstraction;
- [ ] ORM model vs domain model.

Контрольная точка:

- [ ] Могу объяснить, где должна начинаться и заканчиваться транзакция.
- [ ] Могу объяснить, зачем нужен индекс.
- [ ] Не использую ORM entity автоматически как DTO.

---

# Stage 4. Advanced TypeScript & Code Quality

Цель: перейти от базовой типизации к хорошему TypeScript design.

Настроить:

- [ ] `strict`.
- [ ] `noUncheckedIndexedAccess`.
- [ ] `exactOptionalPropertyTypes`.
- [ ] `useUnknownInCatchVariables`.

Изучить:

- [ ] generics;
- [ ] generic constraints;
- [ ] `keyof`;
- [ ] `typeof`;
- [ ] indexed access types;
- [ ] mapped types;
- [ ] conditional types;
- [ ] `infer`;
- [ ] type guards;
- [ ] branded types;
- [ ] template literal types.

Практика:

- [ ] Убрать необоснованные `as`.
- [ ] Убрать необоснованные non-null assertions.
- [ ] Создать несколько полезных generic helpers.
- [ ] Не создавать generic abstraction ради демонстрации generics.
- [ ] Сделать type-safe result types.
- [ ] Сделать type-safe event map в локальном приложении.

Контрольная точка:

- [ ] Могу объяснить generic constraint.
- [ ] Могу написать type guard.
- [ ] Понимаю опасность `as`.
- [ ] Понимаю, когда сложная типизация ухудшает код.

---

# Stage 5. Testing

Цель: сделать тестирование нормальной частью разработки.

Unit:

- [ ] Task entity tests.
- [ ] TaskService tests.
- [ ] Permission logic tests.

Integration:

- [ ] PostgreSQL integration tests.
- [ ] Repository tests.
- [ ] Transaction tests.

E2E:

- [ ] Task API.
- [ ] Project API.
- [ ] Workspace API.

Инструменты:

- [ ] Jest.
- [ ] Testcontainers.
- [ ] fixtures.
- [ ] test builders.

Patterns:

- [ ] Builder Pattern на test data.
- [ ] Object Mother — изучить и сравнить с Builder.

Контрольная точка:

- [ ] Понимаю разницу unit/integration/e2e.
- [ ] Не мокирую всё подряд.
- [ ] Могу объяснить, какие тесты дают настоящую ценность.

---

# Stage 6. Первое разделение на микросервисы

Цель: понять service boundaries и ownership.

Выделить:

- [ ] API Gateway.
- [ ] Auth Service.
- [ ] Project Service.

Определить:

- [ ] ownership данных;
- [ ] API boundaries;
- [ ] что остаётся внутри сервиса;
- [ ] что становится контрактом.

Правила:

- [ ] У каждого сервиса отдельная БД.
- [ ] Нет cross-service JOIN.
- [ ] Нет прямого доступа к чужой БД.
- [ ] Shared library не содержит доменную логику конкретного сервиса.

Контрольная точка:

- [ ] Могу объяснить, почему Auth и Project — разные сервисы.
- [ ] Могу объяснить недостатки слишком мелких сервисов.
- [ ] Могу объяснить, что такое bounded context на практическом уровне.

---

# Stage 7. gRPC

Цель: построить явное синхронное S2S взаимодействие.

- [ ] Добавить `.proto`.
- [ ] Gateway -> Auth по gRPC.
- [ ] Gateway -> Project по gRPC.
- [ ] Добавить error mapping.
- [ ] Добавить deadlines.
- [ ] Добавить metadata.
- [ ] Версионировать contract без breaking changes.

Изучить:

- [ ] protobuf;
- [ ] serialization;
- [ ] unary RPC;
- [ ] streaming conceptually;
- [ ] deadlines;
- [ ] backward compatibility;
- [ ] transport DTO.

Контрольная точка:

- [ ] Могу объяснить REST vs gRPC.
- [ ] Могу объяснить, почему domain entity не должна быть gRPC contract.

---

# Stage 8. Authentication & Device Sessions

Цель: реализовать production-like модель пользовательских сессий.

- [ ] Registration.
- [ ] Login.
- [ ] Password hashing.
- [ ] Access JWT.
- [ ] Refresh token.
- [ ] Refresh rotation.
- [ ] Session entity/table.
- [ ] Device metadata.
- [ ] Current session logout.
- [ ] Selected session revoke.
- [ ] Revoke all except current.
- [ ] Revoke all sessions.
- [ ] Active sessions list.
- [ ] Refresh token reuse detection.

Изучить:

- [ ] JWT structure;
- [ ] claims;
- [ ] `sub`;
- [ ] `sid`;
- [ ] `jti`;
- [ ] access lifetime;
- [ ] refresh lifetime;
- [ ] token rotation;
- [ ] token revocation;
- [ ] refresh token hashing;
- [ ] asymmetric signing.

Контрольная точка:

- [ ] Понимаю, почему JWT не отменяет необходимость server-side session state.
- [ ] Могу объяснить logout при JWT.
- [ ] Могу объяснить refresh token rotation.

---

# Stage 9. GraphQL

Цель: использовать GraphQL там, где он решает реальную read-задачу.

- [ ] Добавить GraphQL endpoint.
- [ ] Сделать Workspace dashboard.
- [ ] Агрегировать Project + Auth data.
- [ ] Добавить resolver authorization.
- [ ] Добавить DataLoader.
- [ ] Продемонстрировать и исправить N+1.

Изучить:

- [ ] schema;
- [ ] resolver;
- [ ] query;
- [ ] mutation;
- [ ] DataLoader;
- [ ] N+1;
- [ ] GraphQL errors.

Контрольная точка:

- [ ] Могу объяснить, почему весь REST не нужно дублировать GraphQL.

---

# Stage 10. RabbitMQ

Цель: перейти к event-driven interaction.

- [ ] Поднять RabbitMQ.
- [ ] Создать exchange.
- [ ] Создать queues.
- [ ] Создать routing keys.
- [ ] Публиковать TaskCreated.
- [ ] Публиковать TaskAssigned.
- [ ] Публиковать TaskStatusChanged.
- [ ] Реализовать consumer.
- [ ] Настроить ack/nack.
- [ ] Настроить retry.
- [ ] Настроить DLQ.
- [ ] Проверить duplicate delivery.

Изучить:

- [ ] command;
- [ ] domain event;
- [ ] integration event;
- [ ] exchange;
- [ ] queue;
- [ ] routing;
- [ ] ack;
- [ ] nack;
- [ ] prefetch;
- [ ] competing consumers;
- [ ] at-least-once delivery.

Контрольная точка:

- [ ] Могу объяснить event vs command.
- [ ] Могу объяснить, почему RabbitMQ может доставить событие повторно.

---

# Stage 11. Transactional Outbox & Inbox

Цель: обеспечить надёжность DB + broker interaction.

- [ ] Реализовать outbox table.
- [ ] Сохранять domain change и outbox message в одной транзакции.
- [ ] Сделать Outbox Worker.
- [ ] Публиковать события из Outbox.
- [ ] Сделать retry публикации.
- [ ] Продумать cleanup.
- [ ] Реализовать idempotent consumer.
- [ ] Добавить Inbox там, где требуется атомарность consumer side.
- [ ] Проверить обработку duplicate event.

Изучить:

- [ ] dual write problem;
- [ ] outbox;
- [ ] inbox;
- [ ] idempotency;
- [ ] exactly-once illusion;
- [ ] eventual consistency.

Контрольная точка:

- [ ] Могу объяснить, почему `save(); publish();` ненадёжно.
- [ ] Могу объяснить, откуда появляются дубли.

---

# Stage 12. Notification Service

Цель: вынести пользовательские уведомления в event-driven сервис.

- [ ] Создать Notification Service.
- [ ] Добавить отдельную PostgreSQL DB.
- [ ] Consumer TaskAssigned.
- [ ] Consumer TaskCommented.
- [ ] Consumer UserMentioned.
- [ ] Consumer TaskStatusChanged.
- [ ] Хранить Created/Delivered/Read.
- [ ] Получать notifications через Gateway.
- [ ] Mark as read.
- [ ] Mark all as read.

Контрольная точка:

- [ ] Project Service не знает о внутренней реализации Notification Service.

---

# Stage 13. MongoDB + Chat Service

Цель: изучить документное хранилище на подходящей задаче.

- [ ] Создать Chat Service.
- [ ] Поднять MongoDB.
- [ ] Создать rooms.
- [ ] Создать messages.
- [ ] Добавить message history.
- [ ] Добавить pagination.
- [ ] Добавить indexes.
- [ ] Добавить mentions.
- [ ] Добавить aggregation query.

Изучить:

- [ ] document model;
- [ ] embedding;
- [ ] references;
- [ ] indexes;
- [ ] aggregation pipeline;
- [ ] pagination;
- [ ] consistency.

Контрольная точка:

- [ ] Могу объяснить, почему здесь MongoDB уместна.
- [ ] Могу объяснить, когда PostgreSQL был бы лучше.

---

# Stage 14. Socket.IO

Цель: добавить realtime взаимодействие.

- [ ] Подключить Socket.IO к API Gateway.
- [ ] Authentication handshake.
- [ ] Rooms.
- [ ] Chat message events.
- [ ] Notification events.
- [ ] Task update events.
- [ ] Typing event.
- [ ] Presence.
- [ ] Reconnect handling.
- [ ] Ack для нужных событий.

Контрольная точка:

- [ ] Понимаю, что WebSocket не заменяет RabbitMQ.
- [ ] Понимаю lifecycle Socket.IO connection.

---

# Stage 15. Redis

## 15.1. Redis Cache

- [ ] Поднять Redis.
- [ ] Реализовать Cache Aside.
- [ ] Выбрать реальный cached use case.
- [ ] Настроить TTL.
- [ ] Реализовать invalidation.
- [ ] Смоделировать stale cache.
- [ ] Смоделировать cache stampede.
- [ ] Изучить distributed lock.

## 15.2. Redis Pub/Sub

- [ ] Запустить несколько API Gateway replicas локально или в k3s.
- [ ] Подключить Socket.IO Redis Adapter.
- [ ] Проверить доставку события пользователю при разных Gateway instances.

Контрольная точка:

- [ ] Могу объяснить разницу Redis Cache и Redis Pub/Sub.

---

# Stage 16. Search Service + Manticore

Цель: реализовать отдельный search projection.

- [ ] Поднять Manticore Search.
- [ ] Создать Search Service.
- [ ] Индексировать Tasks.
- [ ] Индексировать Projects.
- [ ] Индексировать Comments.
- [ ] Индексировать Chat Messages.
- [ ] Обновлять индекс через RabbitMQ.
- [ ] Реализовать full-text query.
- [ ] Реализовать type filters.
- [ ] Реализовать rebuild индекса.

Изучить:

- [ ] inverted index;
- [ ] tokenization;
- [ ] ranking;
- [ ] filters;
- [ ] search projections;
- [ ] eventual consistency.

Дополнительное упражнение:

- [ ] Сравнить Manticore и Elasticsearch концептуально.
- [ ] При желании повторить ограниченный use case на Elasticsearch.

---

# Stage 17. Distributed Systems Failure Lab

Цель: научиться проектировать не только happy path.

Сценарии:

- [ ] RabbitMQ недоступен.
- [ ] Consumer падает до ACK.
- [ ] Consumer падает после side effect до ACK.
- [ ] Один event доставлен дважды.
- [ ] gRPC service отвечает слишком долго.
- [ ] gRPC service недоступен.
- [ ] DB временно недоступна.
- [ ] Redis недоступен.
- [ ] Search недоступен.
- [ ] Socket client reconnects.
- [ ] Два пользователя одновременно изменяют Task.

Изучить и применить:

- [ ] timeout;
- [ ] deadline;
- [ ] retry;
- [ ] exponential backoff;
- [ ] jitter;
- [ ] circuit breaker;
- [ ] optimistic locking;
- [ ] idempotency;
- [ ] graceful degradation;
- [ ] DLQ;
- [ ] distributed lock.

---

# Stage 18. Saga

Цель: изучить coordination распределённых операций только после появления подходящего сценария.

- [ ] Найти реальную cross-service business operation.
- [ ] Смоделировать partial failure.
- [ ] Реализовать choreography variant.
- [ ] Проанализировать недостатки.
- [ ] Реализовать orchestration variant или прототип.
- [ ] Сравнить подходы.
- [ ] Зафиксировать выбранное решение.

Контрольная точка:

- [ ] Saga не используется для простого CRUD.

---

# Stage 19. Observability

Цель: научиться понимать, что происходит внутри распределённой системы.

- [ ] Structured logging.
- [ ] Correlation ID.
- [ ] Trace ID.
- [ ] OpenTelemetry.
- [ ] Metrics.
- [ ] Prometheus.
- [ ] Grafana.
- [ ] Distributed tracing.
- [ ] Trace HTTP -> Gateway -> gRPC -> service.
- [ ] Trace event processing через RabbitMQ.

Контрольная точка:

- [ ] Можно проследить пользовательскую операцию через несколько сервисов.

---

# Stage 20. Docker Compose

Цель: получить воспроизводимый локальный environment.

- [ ] Dockerfile для сервисов.
- [ ] Docker Compose.
- [ ] PostgreSQL instances.
- [ ] MongoDB.
- [ ] RabbitMQ.
- [ ] Redis.
- [ ] Manticore.
- [ ] Healthchecks.
- [ ] Volumes.
- [ ] Networks.

---

# Stage 21. k3s

Цель: перенести систему в Kubernetes.

- [ ] Установить k3s.
- [ ] Создать Namespace.
- [ ] Deploy API Gateway.
- [ ] Deploy Auth Service.
- [ ] Deploy Project Service.
- [ ] Deploy Chat Service.
- [ ] Deploy Notification Service.
- [ ] Deploy Search Service.
- [ ] Deploy databases.
- [ ] Deploy RabbitMQ.
- [ ] Deploy Redis.
- [ ] Deploy Manticore.
- [ ] ConfigMap.
- [ ] Secrets.
- [ ] PersistentVolumeClaims.
- [ ] Services.
- [ ] Ingress.
- [ ] StatefulSets там, где нужны.
- [ ] startupProbe.
- [ ] readinessProbe.
- [ ] livenessProbe.
- [ ] Resource requests.
- [ ] Resource limits.

---

# Stage 22. Helm

Цель: перестать управлять Kubernetes manifests вручную.

- [ ] Создать Helm chart.
- [ ] Разделить templates.
- [ ] Настроить values.
- [ ] Отделить local/dev config.
- [ ] Поддержать replicas.
- [ ] Поддержать resources.
- [ ] Поддержать probes.
- [ ] Установить систему через Helm.
- [ ] Выполнить upgrade.
- [ ] Выполнить rollback.

---

# Stage 23. Headlamp & Operational Practice

Цель: научиться наблюдать и диагностировать систему.

Через Headlamp:

- [ ] Найти Pod.
- [ ] Посмотреть logs.
- [ ] Посмотреть events.
- [ ] Найти Deployment.
- [ ] Изменить replica count.
- [ ] Проверить Services.
- [ ] Проверить ConfigMaps.
- [ ] Проверить Secrets.
- [ ] Проверить PVC.
- [ ] Удалить Pod и наблюдать восстановление.
- [ ] Смоделировать failing readiness probe.
- [ ] Найти причину CrashLoopBackOff.

---

# Stage 24. Финальный Architecture Review

- [ ] Нарисовать актуальную архитектурную схему.
- [ ] Проверить ownership всех данных.
- [ ] Проверить межсервисные контракты.
- [ ] Проверить event contracts.
- [ ] Проверить retries.
- [ ] Проверить idempotency.
- [ ] Проверить Outbox/Inbox.
- [ ] Проверить JWT/session security.
- [ ] Проверить observability.
- [ ] Проверить graceful degradation.
- [ ] Проверить deployment.
- [ ] Обновить functional specification.
- [ ] Обновить technical specification.
- [ ] Удалить устаревшие решения из документации.

---

# Дополнительные темы после основной программы

Эти темы не являются обязательными для основной roadmap.

- [ ] Kafka.
- [ ] Elasticsearch.
- [ ] CQRS.
- [ ] Event Sourcing.
- [ ] OpenAPI client generation.
- [ ] Contract testing.
- [ ] Rate limiting.
- [ ] API versioning.
- [ ] Feature Flags.
- [ ] Secrets management.
- [ ] Service Mesh.
- [ ] Chaos Engineering.
- [ ] Kubernetes autoscaling.
- [ ] Distributed scheduler.

Главное правило: дополнительная технология появляется только после ответа на вопрос:

> Какую конкретную проблему текущей системы мы хотим решить?
