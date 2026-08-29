# Documentation Update — Workspace / Project / Task

Обновлено после domain-design обсуждения Phase 2.

Ключевые решения:
- Workspace/Project memberships как отдельные сущности;
- creator auto-membership + ownership;
- Project Owner/Member/Observer и owner fallback по самому раннему joinedAt;
- Project может быть standalone и перемещаться между Workspace;
- Workspace auto-archive только если нет ни Projects, ни members;
- `Unassigned` — виртуальная коллекция Tasks с `projectId = null`;
- Task state machine: Todo / In Progress / Resolved / Closed / Rejected;
- archive Project финализирует Tasks;
- archive и hard delete строго разделены;
- deleted User сохраняет `userId`, становится Disabled, персональные данные очищаются;
- optimistic concurrency для Task;
- frontend не дублирует backend business rules;
- shadcn-vue Select/Combobox вместо случайных native OS selects;
- skeleton не показывается при каждом background refetch; сохраняются existing data + локальные spinners.

## Microservice boundary update

- Auth Service оставлен только для authentication, credentials, tokens и sessions;
- Profile Service выделен как владелец User/Profile;
- Project Service переименован в Work Management Service;
- Workspace/Project/Task/Comment остаются в одном Work Management bounded context;
- Workspace/Project/Task не дробятся на отдельные сервисы без реальной причины;
- API Gateway работает с Auth/Profile/Work Management/Chat/Notification через публичные внутренние contracts;
- Notification/Activity/Search получают доменные изменения преимущественно через RabbitMQ;
- после split запрещены cross-service SQL и cross-service foreign keys;
- Task lifecycle `Active | Archived` отделён от workflow status;
- deleted Profile сохраняет только `userId` и ФИО; credentials/sessions относятся к Auth.
