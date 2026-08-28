# NexusBoard Frontend Guidelines

## 1. Назначение frontend

Frontend NexusBoard — полноценное SPA-приложение для визуализации и использования возможностей backend.

Основная цель frontend:

- давать удобный пользовательский интерфейс поверх backend-функциональности
- позволять проверять бизнес-сценарии не только через Swagger/API-клиенты
- визуализировать realtime, очереди, кеширование, GraphQL и другие backend-механизмы
- оставаться достаточно простым, чтобы основное время разработки уходило на backend
- поддерживать полноценное использование как desktop SPA и как mobile Web App/PWA на iOS

Frontend должен быть качественным, красивым и удобным, но не должен превращаться во второй учебный архитектурный полигон.

Главный принцип:

> Frontend должен выглядеть и ощущаться как современное SaaS-приложение, но оставаться прагматичным и простым в поддержке.

---

## 2. Технологический стек

Использовать:

- Vue 3
- Vite
- TypeScript
- Vue Router
- TanStack Vue Query
- shadcn-vue
- Tailwind CSS
- Lucide Icons
- VueUse там, где он реально упрощает код
- vite-plugin-pwa для PWA/Web App возможностей

Дополнительные библиотеки добавлять только при наличии реальной потребности.

Не добавлять библиотеку только ради абстракции или популярности.

---

## 3. Архитектурная схема

Frontend взаимодействует только с внешним API NexusBoard.

Целевая схема:

```text
Browser / iOS Web App
        │
        ▼
NexusBoard Web
Vue SPA / PWA
        │
        │ REST / GraphQL / WebSocket
        ▼
API Gateway
        │
        ├── Task Service
        ├── User Service
        ├── Notification Service
        ├── Analytics Service
        └── другие сервисы
```

### Главное правило

Frontend не должен напрямую обращаться к внутренним микросервисам.

Запрещено:

```text
Web → Task Service
Web → User Service
Web → Notification Service
```

Допустимо только:

```text
Web → API Gateway → Services
```

Даже если на раннем этапе backend ещё является единым NestJS-приложением, frontend должен рассматривать его как внешний API Gateway.

Это позволит позже разделять backend на микросервисы без существенной переработки frontend.

---

## 4. Граница ответственности

### Frontend отвечает за

- отображение данных
- пользовательский ввод
- навигацию
- формы
- клиентскую UX-валидацию
- loading states
- empty states
- error states
- optimistic UI там, где это оправдано
- toast notifications
- dialog/sheet интерфейсы
- drag and drop
- realtime-визуализацию
- accessibility
- responsive layout
- mobile UX
- PWA/Web App поведение

### Backend отвечает за

- бизнес-правила
- права доступа
- авторизацию
- бизнес-валидацию
- расчёты
- состояние сущностей
- транзакции
- интеграции
- обработку сообщений
- кеширование
- правила перехода между состояниями

Frontend не должен дублировать backend business logic.

Backend всегда является source of truth.

---

## 5. Разработка параллельно с backend

Frontend развивается одновременно с backend.

После появления законченного backend-сценария агент должен проверить, нужен ли соответствующий UI.

Пример:

```text
POST /tasks
GET /tasks
GET /tasks/:id
DELETE /tasks/:id
```

После появления этих ручек frontend должен поддерживать:

```text
/tasks
/tasks/:id
Create Task
Delete Task
```

После появления:

```text
PATCH /tasks/:id/status
```

должна появиться возможность менять статус через UI.

После появления WebSocket-события:

```text
task.updated
```

открытый board должен обновляться без перезагрузки страницы.

После появления Notification Service frontend должен показывать уведомления пользователю.

Каждая существенная backend-возможность должна по возможности иметь реальный визуальный сценарий использования.

---

## 6. API client

Не писать HTTP-запросы вручную внутри компонентов.

Не использовать напрямую по всему проекту:

```ts
fetch('/api/tasks')
```

или:

```ts
axios.get('/api/tasks')
```

API должен иметь единый клиентский слой.

Предпочтительный вариант:

```text
NestJS OpenAPI
      │
      ▼
openapi.json
      │
      ▼
generated TypeScript client
      │
      ▼
Frontend
```

Frontend должен использовать generated client или единый API abstraction layer.

Не дублировать backend DTO вручную, если тип можно получить из генерируемого контракта.

---

## 7. Server state

Для backend-данных использовать TanStack Vue Query.

Примеры server state:

- tasks
- users
- boards
- comments
- workspaces
- notifications
- statistics

Предпочитать:

```ts
useQuery(...)
useMutation(...)
queryClient.invalidateQueries(...)
```

Не реализовывать вручную собственную систему кеширования, retry, loading/error state без необходимости.

---

## 8. Global state

Не добавлять Pinia автоматически.

Global store использовать только при появлении реального клиентского состояния, которое нужно разделять между многими частями приложения.

Например:

- тема
- состояние sidebar
- некоторые UI preferences
- текущее локальное состояние workspace, если это действительно необходимо

Server state не переносить в Pinia, если TanStack Query уже решает задачу.

---

## 9. Предпочтительная структура frontend

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   └── layouts/
│
├── pages/
│   ├── dashboard/
│   ├── boards/
│   ├── tasks/
│   ├── team/
│   ├── notifications/
│   └── settings/
│
├── features/
│   ├── create-task/
│   ├── update-task/
│   ├── delete-task/
│   └── move-task/
│
├── components/
│   ├── ui/
│   └── shared/
│
├── api/
│   ├── generated/
│   └── queries/
│
├── composables/
├── lib/
├── types/
└── assets/
```

Структура может эволюционировать.

Не создавать директории заранее, если они пока не нужны.

Не плодить без необходимости:

```text
utils
helpers
common
core
shared
services
managers
adapters
facades
repositories
```

---

## 10. UI architecture

Приложение должно иметь единый layout.

Desktop:

```text
App
├── Sidebar
├── Header
│   ├── Breadcrumbs
│   ├── Search
│   ├── Notifications
│   └── User Menu
└── RouterView
```

Основные разделы:

```text
Dashboard
Boards
Tasks
Team
Analytics
Notifications
Settings
```

Sidebar является основным способом desktop-навигации.

---

## 11. SPA

Frontend является полноценным SPA.

Использовать Vue Router.

Пример маршрутов:

```text
/
  → /dashboard

/dashboard
/boards
/boards/:boardId
/tasks
/tasks/:taskId
/team
/notifications
/settings
```

Переходы между страницами не должны перезагружать приложение.

---

## 12. UI/UX требования

Frontend должен выглядеть как современное SaaS-приложение, а не как техническая демонстрация CRUD.

Обязательные элементы UX:

- понятная навигация
- единые spacing и sizing
- единая typography
- единая система цветов
- понятные primary/secondary/destructive actions
- toast notifications
- loading states без визуального мерцания
- empty states
- error states
- confirm dialog для destructive действий
- disabled states
- hover states на desktop
- keyboard accessibility
- focus states
- tooltips для неочевидных действий
- понятная визуальная иерархия
- предсказуемые паттерны поведения между экранами

Новый экран должен продолжать существующую design system, а не создавать собственный стиль.

---

## 13. Loading states

Главная цель loading UX — **не ломать визуальную стабильность интерфейса**.

Не заменять уже отображённый контент skeleton-ами при каждом refetch, invalidation или коротком обновлении данных.

Различать initial cold load, background refetch, mutation in progress и long operation.

Правила:

- skeleton допустим прежде всего на первом открытии экрана, когда данных ещё никогда не было;
- если данные уже отображаются, background refetch не должен убирать их с экрана;
- при коротком refetch сохранять предыдущие данные и при необходимости показывать маленький spinner/progress indicator в локальном месте;
- skeleton не должен мигать на доли секунды;
- для быстрых операций предпочтительнее локальный spinner на кнопке/toolbar/обновляемом блоке;
- при mutation блокировать только реально затронутые controls, а не весь экран;
- не показывать fullscreen loading для локального обновления;
- использовать TanStack Query так, чтобы stale/previous data оставались видимыми во время refetch;
- `isFetching` не означает, что нужно скрыть уже загруженный контент;
- loading state должен сохранять layout и не вызывать скачки.

Плохо:

```text
данные видны → invalidateQueries → весь список превращается в skeleton → данные снова видны
```

Хорошо:

```text
данные остаются видимыми → локальный spinner → данные обновляются без моргания
```


---

## 14. Empty states

Пустой экран должен объяснять, что происходит и что пользователь может сделать дальше.

Плохо:

```text
No data
```

Хорошо:

```text
No tasks yet

Create your first task to start working on this board.

[Create task]
```

---

## 15. Error states

Не показывать пользователю raw backend errors.

Плохо:

```text
AxiosError: Request failed with status code 500
```

Хорошо:

```text
Couldn't load tasks

Something went wrong while loading this board.

[Try again]
```

Технические детали могут логироваться отдельно.

---

## 16. Destructive actions

Удаление и другие необратимые операции требуют confirmation dialog.

Пример:

```text
Delete task?

This action cannot be undone.
"Implement PostgreSQL" will be permanently deleted.

[Cancel] [Delete task]
```

Не использовать `window.confirm`.

---

## 17. Forms

Формы должны:

- показывать validation errors рядом с соответствующим полем
- блокировать submit во время запроса
- защищаться от повторной отправки
- закрываться после успешного действия, если это ожидаемое UX-поведение
- показывать toast после успешной операции
- сохранять введённые данные при recoverable ошибке

Frontend validation используется для UX, но backend всегда повторно валидирует данные.

---

## 18. shadcn-vue

Использовать shadcn-vue как основную базу UI-компонентов.

Предпочитать готовые компоненты:

```text
Button
Dialog
Sheet
DropdownMenu
Input
Textarea
Select
Tabs
Badge
Card
Tooltip
Popover
Command
Breadcrumb
Skeleton
Alert
Toast
Table
Avatar
```

Не создавать собственный аналог готового компонента без причины.

### Select / Combobox policy

Для основных пользовательских форм не использовать нативный desktop `<select>` как финальный UI, если нужен обычный SaaS-style selector.

Предпочитать:

- `Select` из shadcn-vue для небольшого фиксированного набора;
- `Popover + Command` / Combobox pattern для searchable списка;
- `DropdownMenu` только для action menu, а не как замена form select.

Компонент выбора должен визуально соответствовать общей design system, корректно работать с keyboard/focus, помещаться на mobile и не выглядеть как стандартный OS combobox.

Нативные controls допустимы только при осознанной UX/accessibility причине.

---

## 19. Tailwind CSS

Tailwind использовать преимущественно для:

- layout
- spacing
- responsive behaviour
- sizing
- composition

Если UI-решение повторяется, выносить его в компонент.

Не превращать каждый компонент в нечитабельную строку из десятков utility classes без необходимости.

---

## 20. Design consistency

Перед созданием нового UI проверять существующие компоненты.

Не создавать наборы вроде:

```text
PrimaryButton
MainButton
SubmitButton
BlueButton
ActionButton
```

если уже существует общий `Button`.

Использовать одну design system во всём приложении.

---

## 21. Mobile-first требования

Mobile является полноценным поддерживаемым клиентом, а не деградированной desktop-версией.

Каждая user-facing feature должна проверяться минимум в двух режимах:

- desktop/laptop
- mobile

Поддерживать небольшие экраны, начиная примерно с 320–375 px ширины.

Основной mobile UX должен быть рассчитан прежде всего на современные iPhone и Android-устройства.

---

## 22. Mobile navigation

Desktop Sidebar не должен просто уменьшаться на mobile.

Предпочтительная mobile-навигация:

```text
Bottom navigation

Home
Boards
Tasks
Notifications
More
```

Редкие разделы можно размещать в `More`.

Допустим также Drawer/Sheet для вторичной навигации.

---

## 23. Touch UX

На mobile:

- не использовать hover как единственный способ вызвать действие
- интерактивные элементы должны иметь удобный touch target
- важные действия должны быть доступны большим пальцем
- не делать критичные кнопки слишком маленькими
- не требовать точного попадания в мелкие иконки
- учитывать touch gestures только там, где они очевидны пользователю

---

## 24. Mobile dialogs и sheets

Desktop Dialog не всегда должен буквально использоваться на mobile.

При необходимости:

- использовать Bottom Sheet
- использовать Full Screen Dialog
- использовать Drawer

Форма не должна обрезаться экраном или скрываться под клавиатурой.

---

## 25. Responsive data presentation

Table не должна быть единственным способом отображения важных данных.

На mobile при необходимости использовать:

- cards
- stacked rows
- compact lists
- collapsible sections

Избегать горизонтального скролла всего приложения.

Горизонтальный скролл допустим только там, где он является осознанным UX-паттерном, например на Kanban board.

---

## 26. iOS Web App / PWA

NexusBoard должен поддерживать установку на Home Screen и использование как Web App.

Использовать `vite-plugin-pwa`.

Должны быть настроены:

- Web App Manifest
- Service Worker
- app icons
- `display: standalone`
- `start_url`
- theme/background colors
- необходимые meta tags для iOS

Целевой пользовательский сценарий:

```text
Safari
  ↓
Add to Home Screen
  ↓
NexusBoard
  ↓
Standalone Web App
```

Не требовать отдельного native iOS-приложения для базового использования NexusBoard.

---

## 27. iOS Safe Areas

Интерфейс должен учитывать iPhone safe areas.

Использовать при необходимости:

```css
env(safe-area-inset-top)
env(safe-area-inset-bottom)
env(safe-area-inset-left)
env(safe-area-inset-right)
```

Особенно для:

- bottom navigation
- fixed headers
- full-screen sheets
- fullscreen board/page layouts

UI не должен перекрываться Dynamic Island, notch или Home Indicator area.

---

## 28. PWA offline behaviour

Не создавать сложный offline-first режим без отдельной задачи.

На первом этапе Service Worker нужен прежде всего для Web App/PWA поведения и кеширования статических ресурсов.

Если offline-функциональность будет добавляться позднее, она должна проектироваться явно, а не появляться случайно из-за aggressive caching.

Не кешировать API-ответы Service Worker без осознанной стратегии.

---

## 29. Kanban на desktop

Board является одним из основных интерфейсов NexusBoard.

Desktop layout может выглядеть как:

```text
Todo | In Progress | Done
```

Карточка задачи должна минимум показывать:

- title
- priority
- assignee при наличии
- labels при наличии

Позже могут добавляться:

- comments count
- due date
- attachments

---

## 30. Kanban на mobile

Desktop Kanban не должен просто сжиматься до ширины iPhone.

Предпочтительный вариант:

- одна колонка или около одной колонки на viewport
- горизонтальный scroll между колонками
- scroll snapping при необходимости
- touch-friendly drag and drop

Альтернативный UX допустим через status tabs, если он окажется удобнее.

Task details на mobile предпочтительно открывать через Sheet/Full Screen view.

---

## 31. Drag and Drop

Drag and drop подключать, когда backend поддерживает изменение состояния задачи.

На desktop и mobile должен работать touch/pointer input.

Frontend не должен считать перенос окончательно успешным до ответа backend.

Допустимый сценарий:

```text
drag
 ↓
optimistic move
 ↓
PATCH task
 ↓
success
```

При ошибке:

```text
rollback
+
toast
```

---

## 32. Realtime

Когда backend добавляет WebSocket/SSE/realtime transport, frontend должен использовать его для обновления данных.

Пример:

```text
User A
moves task

↓

Task Service

↓

event

↓

Gateway

↓

WebSocket

↓

User B
sees update
```

Не перезагружать страницу целиком.

Не использовать постоянный polling, если realtime уже доступен и подходит сценарию.

---

## 33. Notifications

Уведомления использовать в двух формах.

### Temporary

Toast для краткоживущего feedback:

```text
Task created successfully
```

### Persistent

Notification Center:

```text
/notifications
```

или dropdown в Header.

На mobile Notification Center должен быть удобен для touch и небольшого экрана.

---

## 34. GraphQL

Frontend может использовать GraphQL, если backend предоставляет его через API Gateway.

GraphQL не добавлять искусственно.

Использовать для сложных связанных read-сценариев, например:

```text
Board
├── columns
│   └── tasks
│       ├── assignee
│       └── labels
└── statistics
```

Обычный CRUD может продолжать использовать REST.

---

## 35. REST

REST использовать для простых операций:

```text
create
update
delete
simple collections
commands
```

Не переписывать существующий работающий REST API на GraphQL только ради единообразия.

---

## 36. WebSocket

WebSocket использовать для:

- realtime board updates
- online users
- live notifications
- collaborative events

Не использовать WebSocket для обычного CRUD, если HTTP подходит лучше.

---

## 37. Microservices

Frontend не должен знать:

- какой сервис хранит задачу
- какой сервис отвечает за пользователя
- какой broker используется
- где находится Redis
- какой сервис публикует событие
- какой сервис потребляет сообщение

Для frontend существуют только контракты API Gateway.

---

## 38. RabbitMQ

RabbitMQ является внутренней частью backend.

Frontend никогда напрямую с RabbitMQ не работает.

```text
Task Service
   ↓
RabbitMQ
   ↓
Notification Service
   ↓
Gateway
   ↓
WebSocket
   ↓
Frontend
```

Frontend видит только итоговое событие.

---

## 39. Redis

Frontend не должен знать о Redis.

Redis может использоваться backend для:

- cache
- pub/sub
- distributed state
- rate limiting
- sessions

Frontend просто получает результат через внешний API.

---

## 40. gRPC

Frontend напрямую не использует gRPC внутренних сервисов.

gRPC предназначен преимущественно для:

```text
Gateway ↔ Services
Service ↔ Service
```

Browser взаимодействует с Gateway через REST, GraphQL и WebSocket, если отдельно не принято другое архитектурное решение.

---

## 41. Authentication

Когда появляется auth:

```text
Frontend
   ↓
Gateway
   ↓
Auth
```

Скрытие кнопки на frontend является только UX, а не security boundary.

Backend обязан самостоятельно проверять permissions.

---

## 42. Generated contracts

Где возможно, frontend использует типы из автоматически генерируемых контрактов.

Не создавать вручную собственный `TaskDto`, если он уже генерируется из backend API.

---

## 43. Компоненты

Компонент должен иметь понятную ответственность.

Хорошо:

```text
TaskCard
TaskBoard
TaskDetails
CreateTaskDialog
DeleteTaskDialog
BoardColumn
```

Плохо:

```text
UniversalEntityManager
GenericDataController
DynamicEverythingComponent
```

Не создавать универсальные abstraction-компоненты раньше времени.

---

## 44. Composables

Composables использовать для повторяемого поведения.

Например:

```text
useTasks
useTask
useCreateTask
useDeleteTask
useBoardSocket
```

Не превращать composables в скрытый service layer с бизнес-логикой.

---

## 45. Простота кода

Frontend будет частично поддерживаться человеком, который основное время занимается backend.

Поэтому код должен быть:

- простым
- предсказуемым
- читаемым
- без frontend-магии ради магии

Предпочитать очевидный код умному коду.

---

## 46. Не переусложнять

Не создавать без необходимости:

- repository pattern на frontend
- unit of work
- frontend DDD
- CQRS
- собственный event bus
- dependency injection container
- abstract factories
- generic CRUD frameworks
- большое количество промежуточных adapters/facades

Frontend не должен копировать backend architecture.

---

## 47. Работа агента после backend-задачи

После завершения backend feature агент должен проверить:

1. появился ли новый пользовательский сценарий
2. нужен ли новый экран
3. нужно ли изменить существующий экран
4. требуется ли новая query/mutation
5. нужно ли обновить generated API client
6. нужен ли loading state
7. нужен ли empty state
8. нужен ли error state
9. нужен ли toast/notification
10. нужен ли realtime update
11. как сценарий работает на mobile
12. как сценарий работает в iOS standalone Web App

Вносить минимальные необходимые frontend-изменения, не раздувая задачу без причины.

---

## 48. Frontend не должен блокировать backend

Frontend не должен становиться причиной большого отвлечения от backend.

Если новая backend-функция пока не требует сложного UI, использовать минимальный качественный интерфейс.

Сначала:

```text
Task list
Create dialog
Delete action
```

Позже, когда backend будет готов:

```text
Kanban
Drag & Drop
Realtime
Analytics
```

---

## 48.1. Workspace / Project / Task — frontend contract

При реализации Phase 2 frontend обязан считать backend единственным source of truth для бизнес-правил.

### Workspace

- создание Workspace;
- creator ownership приходит от backend;
- отображение members, Projects, Active/Archived;
- Archive — отдельное действие;
- hard delete не показывать обычному пользователю, пока не появится отдельный admin UX;
- не вычислять auto-archive на клиенте.

### Project

- Project может быть внутри Workspace или standalone;
- creator становится Owner на backend;
- роли: Owner/Member/Observer;
- ownership transfer — отдельный action;
- Project можно перемещать между Workspace;
- Archive и hard delete — разные actions;
- при archive frontend не переводит Tasks сам — он получает итоговое состояние от backend.

### Unassigned

`Unassigned` — виртуальная коллекция, **не настоящий Project**.

Frontend:

- показывает её только для Tasks с `projectId = null`;
- не создаёт Unassigned Project через API;
- не показывает rename/archive/delete/settings как для Project;
- после назначения Project обновляет UI по успешному backend response.

### Task state machine

```text
Todo | In Progress | Resolved | Closed | Rejected
```

Frontend не должен изобретать собственные переходы. `Closed` и `Rejected` отображаются frozen, но backend остаётся security/business boundary.

### Deleted user

Исторический deleted user продолжает отображаться по прежнему `userId`; avatar заменяется на Deleted User placeholder. Frontend не пытается связать старый `userId` с новым аккаунтом по email/name.

### Нельзя

- дублировать cascade archive rules на клиенте;
- вычислять нового Project Owner на frontend;
- считать Unassigned реальным Project;
- использовать hard delete вместо Archive;
- восстанавливать terminal Task только изменением client state.


---

## 49. Этапы развития frontend

### Этап 1. Application shell и Task CRUD

Реализовать:

- `/tasks`
- `/tasks/:id`
- Sidebar
- Header
- базовую mobile navigation
- список задач
- просмотр задачи
- создание
- удаление
- loading/empty/error states
- toast notifications

### Этап 2. PWA baseline

Добавить:

- vite-plugin-pwa
- manifest
- app icons
- standalone mode
- iOS meta tags
- safe-area support
- корректную установку на Home Screen

### Этап 3. Task editing

После backend update API:

- edit title
- edit description
- priority
- status

### Этап 4. Kanban Board

После появления board/domain API:

- `/boards/:boardId`
- columns
- cards
- task creation
- task details
- desktop drag and drop
- touch drag and drop
- mobile horizontal board UX

### Этап 5. Users and Team

После появления User Service:

- `/team`
- users
- avatars
- roles
- assignments

### Этап 6. Authentication

После появления Auth:

- login
- logout
- current user
- route guards
- permission-aware UI

### Этап 7. Realtime

После появления realtime backend:

- live board updates
- connection status
- realtime notifications

### Этап 8. Notifications

После появления Notification Service:

- notification dropdown
- unread badge
- notification page
- mobile-friendly notification UI

### Этап 9. Dashboard

После появления analytics API:

- `/dashboard`
- tasks by status
- recent activity
- overdue tasks
- team activity
- useful metrics

### Этап 10. GraphQL

Использовать GraphQL минимум в одном реальном сложном UI-сценарии, например Board или Dashboard.

Не переписывать весь frontend ради GraphQL.

---

## 49.1. Visual quality gate для агента

Перед завершением frontend-задачи агент обязан отдельно проверить визуальное качество, а не только функциональность.

Проверить:

- не остались ли нативные OS-looking select/combobox controls там, где должен использоваться shadcn-vue;
- не заменяется ли уже загруженный контент skeleton-ами при background refetch;
- нет ли мерцания при query invalidation;
- локальные mutations используют локальные spinner/disabled states;
- dialog, popover, select и command имеют единый внешний вид;
- active/archived/terminal states визуально различимы;
- mobile и desktop используют одинаковую семантику действий;
- frontend не додумывает backend cascade/ownership/membership rules.

Если интерфейс функционально работает, но выглядит как набор browser-native controls или заметно моргает при обычных обновлениях, feature не считается завершённой.


---

## 50. Definition of Done для frontend feature

Frontend часть feature считается завершённой, когда:

- пользователь может выполнить основной сценарий
- запросы используют единый API layer
- TypeScript не содержит ошибок
- loading state реализован без лишнего flicker/skeleton replacement
- error state реализован
- empty state реализован, если применимо
- success feedback реализован
- UI соответствует существующей design system и не использует случайные OS-native controls
- нет дублирования backend business logic
- нет прямого обращения к внутреннему микросервису
- нет очевидной unnecessary abstraction
- layout работает на desktop/laptop
- layout работает на mobile
- основной сценарий не зависит от hover
- touch targets удобны
- нет случайного horizontal overflow
- dialogs/menus/forms помещаются на мобильный экран
- iOS safe areas учтены
- сценарий пригоден для использования из установленного iOS Web App

---

## 51. Приоритеты

При конфликте использовать порядок:

1. Корректность бизнес-сценария
2. Соответствие backend API
3. Простота поддержки
4. UX
5. Mobile usability
6. Визуальная консистентность
7. Accessibility
8. Производительность
9. Абстрактная архитектурная чистота

Не жертвовать простотой ради красивой архитектурной схемы.

---

## 52. Главное правило работы агента

Перед созданием frontend-кода ответить на вопрос:

> Какой пользовательский backend-сценарий мы сейчас визуализируем?

Если ответа нет, вероятно, frontend-код пока не нужен.

Frontend NexusBoard существует для того, чтобы backend-система становилась полноценным, красивым и удобным приложением на desktop и mobile, а не оставалась только набором API.
