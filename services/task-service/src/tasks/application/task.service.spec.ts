import { TaskService } from './task.service';
import type { TaskRepository } from './ports/task.repository';
import type { Task } from '../domain/task';

describe('TaskService', () => {
  let repository: jest.Mocked<TaskRepository>;
  let service: TaskService;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };
    service = new TaskService(repository);
  });

  it('создаёт задачу со статусом Todo и сохраняет её', () => {
    jest.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-0000-0000-000000000000');

    const task = service.create({
      title: 'Подготовить релиз',
      description: 'Проверить changelog',
      priority: 'High',
    });

    expect(task).toMatchObject({
      id: '00000000-0000-0000-0000-000000000000',
      title: 'Подготовить релиз',
      description: 'Проверить changelog',
      priority: 'High',
      status: 'Todo',
    });
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.updatedAt).toBe(task.createdAt);
    expect(repository.save.mock.calls).toEqual([[task]]);
  });

  it('обновляет только переданные поля и удаляет description через null', () => {
    const task: Task = {
      id: 'task-id',
      title: 'Исходное название',
      description: 'Описание',
      priority: 'Low',
      status: 'Todo',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    repository.findById.mockReturnValue(task);

    const result = service.update('task-id', {
      title: 'Новое название',
      description: null,
      priority: 'High',
      status: 'Done',
    });

    expect(result).toMatchObject({
      title: 'Новое название',
      priority: 'High',
      status: 'Done',
    });
    expect(result).not.toHaveProperty('description');
    expect(result?.updatedAt.getTime()).toBeGreaterThanOrEqual(task.createdAt.getTime());
    expect(repository.save.mock.calls).toEqual([[task]]);
  });

  it('не сохраняет отсутствующую задачу при обновлении', () => {
    repository.findById.mockReturnValue(undefined);

    expect(service.update('missing-id', { status: 'Done' })).toBeUndefined();
    expect(repository.save.mock.calls).toHaveLength(0);
  });

  it('передаёт заданные фильтры и сортировку в репозиторий', () => {
    const tasks: Task[] = [];
    repository.findAll.mockReturnValue(tasks);
    const query = {
      status: 'In Progress' as const,
      priority: 'Medium' as const,
      sortBy: 'priority' as const,
      order: 'desc' as const,
    };

    expect(service.findAll(query)).toBe(tasks);
    expect(repository.findAll.mock.calls).toEqual([[query]]);
  });
});
