# NexusBoard — Project Rules

## 1. Назначение

Этот документ содержит обязательные правила, договорённости и допущения проекта.

В него могут добавляться:

- coding conventions;
- naming rules;
- архитектурные ограничения;
- правила комментариев;
- правила тестирования;
- правила работы с БД;
- требования к API;
- требования к сообщениям;
- правила инфраструктуры;
- временные учебные ограничения.

При конфликте временного решения с этим документом решение должно быть отдельно зафиксировано как исключение.

---

# 2. Главный принцип

> Каждое усложнение должно решать конкретную существующую проблему.

Запрещено добавлять технологию, паттерн или abstraction только потому, что они существуют или должны быть продемонстрированы.

Перед новым архитектурным решением нужно уметь ответить:

1. Какую проблему мы имеем сейчас?
2. Почему текущее решение недостаточно?
3. Что даёт новое решение?
4. Какие новые недостатки оно создаёт?
5. Стоит ли цена усложнения полученной пользы?

---

# 3. Формат обучения

Проект является учебным, но обучение строится вокруг **крупных вертикальных продуктовых срезов**, а не вокруг микрозадач по отдельным концептам.

Приоритет:

```text
понимание + практика > формальное прохождение списка тем
```

Правила:

- знакомая тема не превращается в отдельный учебный этап без причины;
- теоретически знакомая технология может вводиться сразу в правильном месте, если сценарий её требует;
- не нужно намеренно строить заведомо неподходящую архитектуру только ради последующего обучающего рефакторинга;
- слабая или новая тема разбирается глубже прямо внутри продуктовой задачи;
- TypeScript и testing являются постоянной частью всех фаз;
- крупная задача сначала проектируется, затем реализуется разумными кусками и проходит review.

Переписывание оправдано, когда изменилась задача, обнаружился реальный недостаток или появился новый материал, а не ради ритуальной демонстрации эволюции.

---

# 4. Roadmap

Roadmap задаёт продуктовые фазы, а не жёсткий запрет на использование технологии до конкретного номера этапа.

Технологию можно применять, если она соответствует текущему сценарию, её роль понятна и она не создаёт неоправданный overhead.

Примеры:

- асинхронный межсервисный flow можно сразу проектировать через RabbitMQ;
- синхронный S2S после разделения сервисов можно сразу делать через gRPC;
- Socket.IO вводится вместе с realtime chat;
- Redis Adapter вводится при масштабировании Socket.IO;
- Saga не вводится без распределённого бизнес-процесса;
- Kafka не вводится, пока RabbitMQ покрывает требования.

---

# 5. TypeScript

## 5.1. Strict mode

TypeScript должен работать в строгом режиме.

Целевые настройки:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "useUnknownInCatchVariables": true
}
```

## 5.2. `any`

`any` запрещён без документированной причины.

Допустимые исключения:

- интеграция с библиотекой с некорректными типами;
- временная миграция legacy code;
- ограниченный adapter layer.

Во всех остальных случаях использовать корректный тип или `unknown`.

## 5.3. Type assertions

Избегать:

```ts
value as SomeType
```

если assertion используется только чтобы заставить компилятор замолчать.

Допустимо, если разработчик может доказать runtime-инвариант, которого TypeScript не способен вывести.

## 5.4. Non-null assertion

Избегать:

```ts
value!
```

Если значение теоретически может отсутствовать, этот сценарий должен быть обработан явно.

## 5.5. `type` и `interface`

Нет правила «всегда использовать только одно».

Общее соглашение:

- `interface` удобно использовать для контрактов объектов и расширяемых public shapes;
- `type` использовать для unions, intersections, aliases, mapped/conditional types и сложных композиций.

Выбор должен зависеть от смысла, а не от привычки из C#.

## 5.6. Enums

Enum не является обязательным выбором для каждого фиксированного набора значений.

Нужно осознанно выбирать между:

```ts
enum TaskStatus {}
```

и:

```ts
type TaskStatus = 'todo' | 'in-progress' | 'done';
```

Решение должно учитывать:

- runtime representation;
- сериализацию;
- transport contracts;
- interoperability.

## 5.7. Generics

Generic abstraction создаётся только если она устраняет реальное дублирование или обеспечивает полезную типобезопасность.

Запрещено создавать сложные generics ради демонстрации знаний TypeScript.

---

# 6. Naming

## 6.1. Общие правила

- classes — `PascalCase`;
- interfaces/types — `PascalCase`;
- enums — `PascalCase`;
- functions — `camelCase`;
- variables — `camelCase`;
- constants — `UPPER_SNAKE_CASE` только для настоящих глобальных констант;
- files — согласованный `kebab-case`.

Примеры:

```text
task.service.ts
task.controller.ts
create-task.dto.ts
task-status.ts
```

## 6.2. Boolean variables

Boolean должен читаться как вопрос или утверждение.

Хорошо:

```ts
isActive
hasAccess
canEdit
shouldRetry
```

Плохо:

```ts
activeFlag
check
value
```

## 6.3. Коллекции

Название должно отражать множественность.

Хорошо:

```ts
users
taskIds
sessions
messages
```

## 6.4. Методы

Имя должно отражать действие.

Примеры:

```ts
createTask()
assignTask()
changeStatus()
revokeSession()
findUserById()
```

Избегать бессодержательных:

```ts
process()
handle()
doWork()
manage()
```

если контекст не делает значение очевидным.

---

# 7. Comments

## 7.1. Комментарий объясняет причину

Хороший комментарий отвечает на вопрос:

> Почему код сделан именно так?

Плохой комментарий пересказывает код.

Плохо:

```ts
// increment counter
counter++;
```

Хорошо:

```ts
// Keep the previous version for optimistic concurrency checks.
version++;
```

## 7.2. JSDoc

JSDoc использовать для:

- public API;
- нетривиальных контрактов;
- библиотечных функций;
- важных ограничений;
- поведения, которое нельзя выразить типами.

Не нужно писать JSDoc над каждым очевидным private method.

## 7.3. TODO

TODO должен быть конкретным.

Плохо:

```ts
// TODO fix later
```

Хорошо:

```ts
// TODO: replace in-memory session store with PostgreSQL in Stage 8.
```

---

# 8. Code structure

Запрещены:

- god classes;
- giant services;
- файлы на сотни строк без причины;
- shared utility dumping ground;
- циклические зависимости;
- abstraction ради abstraction.

Класс или модуль должен иметь понятную ответственность.

## 8.1. Границы monorepo

Каждый сервис владеет своими domain-моделями, application logic, infrastructure, config, migrations и тестами.

Запрещено импортировать внутренний код другого сервиса или приложения. Взаимодействие между ними
выполняется только через HTTP, gRPC или integration events.

`packages` содержит только самостоятельные versioned packages. Нельзя выносить в него shared domain-модели,
бизнес-логику или внутренние DTO сервисов.

## 8.2. Целевые service boundaries

Целевые backend-сервисы:

```text
API Gateway
Auth Service
Profile Service
Work Management Service
Chat Service
Notification Service
Activity Service
Search Service
```

Правила ответственности:

- Auth владеет credentials, tokens и sessions;
- Profile владеет User/Profile и его display/personal data;
- Work Management владеет Workspace, Project, Task, Comment и memberships;
- Chat владеет communication domain;
- Notification создаёт пользовательские уведомления из событий;
- Activity хранит пользовательскую activity history, но не является Event Store;
- Search владеет только search projection/index;
- Gateway не владеет доменными данными.

Не называть сервис по одной вложенной сущности, если его bounded context существенно шире. Поэтому домен Workspace/Project/Task называется `Work Management Service`, а не `Project Service`.

Не разделять Workspace, Project и Task на отдельные микросервисы без конкретной причины. Пока между ними существуют атомарные business operations, локальная транзакция предпочтительнее искусственной distributed consistency.

---

# 9. NestJS

Controller:

- принимает transport request;
- валидирует через framework mechanisms;
- вызывает application logic;
- преобразует результат в transport response.

Controller не должен содержать:

- SQL;
- сложную бизнес-логику;
- прямую работу с broker.

Service не должен автоматически становиться свалкой всей логики модуля.

---

# 10. DTO

Различать:

```text
HTTP DTO
gRPC contract
RabbitMQ event
Domain model
Persistence model
```

Они могут быть похожими, но не обязаны быть одним и тем же типом.

Если модели принадлежат разным границам и могут независимо эволюционировать, использовать явный mapping. Не полагаться на случайную structural compatibility как на скрытый контракт между слоями.

---

# 11. Domain model

Важные business invariants не должны существовать только в Controller.

## 11.1. Workspace

- creator автоматически получает Workspace membership и становится Owner;
- `colorCategoryId` ссылается на отдельную color/category entity;
- `iconId` ссылается на metadata иконки; binary content не хранится прямо в Workspace row;
- Workspace имеет `Active | Archived` и `archivedAt`;
- отсутствие Projects допустимо, если остаются members;
- если не осталось ни Projects, ни members, Workspace автоматически архивируется;
- archive и hard delete не смешиваются.

## 11.2. Project

- `workspaceId` может быть `null`;
- creator автоматически получает Project membership и становится единственным Owner;
- роли: `Owner | Member | Observer`;
- вручную ownership можно передать одному из участников;
- при удалении Owner новый Owner выбирается по самому раннему `joinedAt`: сначала Member, затем Observer;
- если других участников нет, Project архивируется;
- Project можно перемещать между Workspace;
- участники Project должны иметь доступ к Workspace, в котором Project находится;
- archive Project финализирует Tasks.

## 11.3. Task

Статусы: `Todo | In Progress | Resolved | Closed | Rejected`.

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

После `Closed` или `Rejected` workflow Task не редактируется.

Отдельно Task имеет lifecycle status:

```text
Active | Archived
```

Архивирование не смешивается с workflow status. При archive Project Task переводится в lifecycle `Archived`, а workflow меняется по правилам Project archive.

`projectId = null` допустим и означает Unassigned Task. `Unassigned` является projection/virtual collection и не моделируется как Project entity.

`completedAt` на текущем этапе не вводится.

## 11.4. User/Profile deletion

- `userId` сохраняется;
- Profile становится `Disabled`;
- сохраняются `userId` и ФИО;
- остальные персональные profile fields очищаются;
- credentials/sessions удаляются или отзываются в Auth;
- исторические ссылки сохраняются;
- новая регистрация создаёт новый `userId`.

Profile и Auth — разные ответственности даже если на раннем этапе технически работают в одном runtime.

Эти правила должны защищаться domain/application logic независимо от transport layer.


# 12. Database ownership

Каждый микросервис владеет своей БД.

Запрещено:

- читать таблицу другого сервиса;
- делать cross-service SQL JOIN;
- использовать один общий ORM context между сервисами.

Для получения чужих данных используются:

- API/gRPC;
- events;
- local projection, если оправдано.

После microservice split Work Management не имеет FK на таблицу Profile Service. `userId` является межсервисным идентификатором, а referential consistency между сервисами обеспечивается контрактами и бизнес-процессами, не cross-service SQL.

---

# 13. PostgreSQL

Каждое важное ограничение желательно защищать не только кодом, но и БД, если это возможно.

Использовать:

- foreign keys;
- unique constraints;
- NOT NULL;
- indexes.

Не полагаться исключительно на application validation для фундаментальной целостности данных.

Phase 2:

- Workspace `name` unique;
- Project `name` unique внутри одного Workspace;
- standalone Project names unique между standalone Projects;
- учитывать PostgreSQL `NULL` semantics и использовать partial unique index там, где нужно;
- `projects.workspace_id` nullable;
- `tasks.project_id` nullable;
- membership relations оформляются отдельными таблицами;
- `joinedAt` ProjectMember участвует в fallback ownership;
- Task имеет version/эквивалент для optimistic concurrency.

---

# 14. Transactions

Transaction boundary должен соответствовать бизнес-операции.

Запрещено:

- делать огромную транзакцию вокруг несвязанных действий;
- держать SQL transaction открытой во время network calls без серьёзной причины.

Phase 2 atomic business operations:

- create Workspace + creator membership;
- create Project + creator membership;
- manual ownership transfer;
- owner deletion fallback;
- archive Project + Task finalization;
- Project move + required membership updates.

---

# 15. MongoDB

MongoDB не использовать только потому, что данные представлены JSON.

Перед выбором нужно ответить:

- нужна ли документная модель;
- какие запросы будут выполняться;
- какие нужны индексы;
- нужен ли relational consistency.

---

# 16. REST

REST endpoint должен быть понятным с точки зрения resource/action semantics.

Не превращать всё в:

```text
POST /doSomething
```

без причины.

---

# 17. GraphQL

GraphQL вводится для реальной потребности клиента в гибком/составном чтении.

Не дублировать REST API один в один только ради наличия GraphQL.

---

# 18. gRPC

gRPC contract является отдельным публичным контрактом сервиса.

Правила:

- не удалять существующие protobuf field numbers;
- не переиспользовать удалённые номера;
- избегать breaking changes;
- использовать deadlines;
- явно обрабатывать transport errors.

---

# 19. RabbitMQ

Consumer должен считаться потенциально вызываемым повторно.

Следствие:

> обработчики сообщений проектируются idempotent whenever side effects matter.

Не рассчитывать на exactly-once delivery.

---

# 20. Events

Integration event:

- описывает факт;
- называется в прошедшем времени;
- является immutable contract.

Хорошо:

```text
TaskAssigned
TaskCreated
UserMentioned
```

Событие не должно быть RPC, замаскированным под event.

---

# 21. Outbox

Для изменения БД и последующей гарантированной публикации критичного integration event используется Outbox.

Очистка Outbox должна быть предусмотрена.

---

# 22. Inbox

Inbox используется там, где нужны:

- deduplication;
- atomic consumer-side processing;
- гарантированный контроль повторов.

Не создавать Inbox во всех сервисах автоматически.

---

# 23. Redis

Redis всегда должен иметь явно определённую роль.

В документации и коде различать:

- Redis Cache;
- Redis Pub/Sub;
- distributed lock;
- временное state storage.

Не считать Redis основной БД без специального архитектурного решения.

---

# 24. Cache

Cache не является источником истины.

Всегда должно быть понятно:

- кто владеет исходными данными;
- когда cache invalidated;
- какой TTL;
- что происходит при cache miss;
- что происходит при недоступности Redis.

---

# 25. Socket.IO

Socket.IO отвечает за client realtime delivery.

Он не заменяет межсервисный broker.

События, критичные для внутренних сервисов, не должны существовать только в WebSocket connection.

---

# 26. Search

Search index не является источником истины.

Он является projection данных из доменных сервисов.

Должен существовать способ rebuild индекса.

---

# 27. Error handling

Ошибки должны быть:

- ожидаемыми и типизированными на application/domain уровне;
- преобразованы в подходящий transport error на boundary.

Не использовать `throw new Error("something went wrong")` для всех сценариев.

---

# 28. Logging

Лог должен быть полезен для диагностики.

Не логировать:

- passwords;
- refresh tokens;
- access tokens;
- secrets;
- полные чувствительные payloads.

Предпочитать structured logs.

---

# 29. Security

Запрещено хранить в plaintext:

- passwords;
- refresh tokens;
- secrets.

Secrets не коммитятся в repository.

---

# 30. Testing

Тестируется поведение, а не внутреннее устройство.

Не создавать тест, который ломается только потому, что private method переименовали.

Приоритет:

- business rules;
- integration boundaries;
- persistence;
- contracts;
- failure scenarios.

---

# 31. Mocks

Mocks применять осознанно.

Не мокировать PostgreSQL repository в integration test, цель которого — проверить работу с PostgreSQL.

Не мокировать весь мир в unit test так, что тест перестаёт проверять полезное поведение.

---

# 32. Infrastructure

На ранних этапах инфраструктура должна быть минимальной.

Эволюция:

```text
local process
    ↓
Docker dependencies
    ↓
Docker Compose
    ↓
k3s
    ↓
Helm
```

---

# 33. Kubernetes

Не хранить application state внутри Pod filesystem.

Приложение должно корректно переживать перезапуск Pod.

---

# 34. Health checks

Readiness означает:

> сервис способен принимать traffic.

Liveness означает:

> процесс не застрял и не нуждается в restart.

Startup probe используется для сервисов, которым требуется время на старт.

Нельзя делать одинаковую проверку для всех probes без понимания смысла.

---

# 35. Observability

Для distributed operation должны распространяться correlation/trace identifiers.

Нельзя считать `console.log()` полноценной observability strategy.

---

# 36. Documentation

Документация должна отражать актуальное целевое состояние.

Если архитектурное решение изменилось:

1. обновить соответствующий specification;
2. удалить или пометить устаревшее решение;
3. обновить roadmap при необходимости.

Не хранить несколько противоречащих друг другу «истин».

---

# 37. Code review

При review всегда проверять минимум:

- корректность;
- типобезопасность;
- naming;
- читаемость;
- responsibility;
- error handling;
- concurrency;
- transaction boundaries;
- idempotency, если есть messaging;
- security;
- tests.

---

# 38. Учебный review

Для каждого значимого решения разработчик должен быть способен ответить:

- Почему выбран этот тип?
- Почему здесь class?
- Почему этот метод async?
- Почему это отдельный сервис?
- Почему здесь нужен broker?
- Что будет при повторе операции?
- Что будет при частичном сбое?
- Что будет при параллельном запросе?

Если ответ — «так принято», тему нужно разобрать глубже.

---

# 39. Анти-паттерны проекта

Без обоснования запрещены:

- `any`;
- массовые `as`;
- giant services;
- god modules;
- shared database;
- repository ради repository;
- factory ради factory;
- builder ради builder;
- CQRS ради CQRS;
- microservice ради microservice;
- Redis ради Redis;
- Kafka ради Kafka;
- Kubernetes ради Kubernetes;
- abstraction ради abstraction.

---

# 40. Финальное правило

Если есть выбор между:

```text
простым понятным решением
```

и:

```text
сложным "enterprise" решением без текущей необходимости
```

выбирается первое.

Сложное решение добавляется позже, когда проект действительно создаст проблему, которую оно решает.
