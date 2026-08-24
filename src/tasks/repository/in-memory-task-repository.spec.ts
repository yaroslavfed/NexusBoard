import { InMemoryTaskRepository } from './in-memory-task-repository';
import type { Task } from '../domain/task';

const createTask = (
  id: string,
  priority: Task['priority'],
  status: Task['status'],
  createdAt: string,
): Task => ({
  id,
  title: id,
  priority,
  status,
  createdAt: new Date(createdAt),
  updatedAt: new Date(createdAt),
});

describe('InMemoryTaskRepository', () => {
  it('фильтрует задачи по статусу и priority', () => {
    const repository = new InMemoryTaskRepository();
    const todo = createTask('todo', 'High', 'Todo', '2026-01-03T00:00:00.000Z');
    const done = createTask('done', 'High', 'Done', '2026-01-02T00:00:00.000Z');
    repository.save(todo);
    repository.save(done);
    repository.save(createTask('low', 'Low', 'Todo', '2026-01-01T00:00:00.000Z'));

    expect(repository.findAll({ status: 'Todo', priority: 'High' })).toEqual([todo]);
  });

  it('сортирует по priority в убывающем порядке', () => {
    const repository = new InMemoryTaskRepository();
    const low = createTask('low', 'Low', 'Todo', '2026-01-01T00:00:00.000Z');
    const high = createTask('high', 'High', 'Todo', '2026-01-02T00:00:00.000Z');
    const medium = createTask('medium', 'Medium', 'Todo', '2026-01-03T00:00:00.000Z');
    repository.save(low);
    repository.save(high);
    repository.save(medium);

    expect(repository.findAll({ sortBy: 'priority', order: 'desc' })).toEqual([high, medium, low]);
  });

  it('удаляет задачу и сообщает, была ли она найдена', () => {
    const repository = new InMemoryTaskRepository();
    repository.save(createTask('task-id', 'Low', 'Todo', '2026-01-01T00:00:00.000Z'));

    expect(repository.delete('task-id')).toBe(true);
    expect(repository.findById('task-id')).toBeUndefined();
    expect(repository.delete('task-id')).toBe(false);
  });
});
