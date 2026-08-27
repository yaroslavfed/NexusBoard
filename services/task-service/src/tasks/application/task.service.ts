import type { Task } from '../domain/task';
import { Inject, Injectable } from '@nestjs/common';
import type { TaskRepository } from './ports/task.repository';
import { TASK_REPOSITORY } from '../task.constants';
import type { CreateTaskInput } from '../presentation/http/schema/create-task.schema';
import type { UpdateTaskInput } from '../presentation/http/schema/update-task.schema';
import type { TaskQuery } from '../presentation/http/schema/task-query.schema';
import type { TaskSearchOptions } from './task-search-options';

@Injectable()
export class TaskService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  create(input: CreateTaskInput): Task {
    const now = new Date();

    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      priority: input.priority,
      status: 'Todo',
      createdAt: now,
      updatedAt: now,
      ...(input.description !== undefined ? { description: input.description } : {}),
    };

    this.taskRepository.save(task);
    return task;
  }

  update(id: string, input: UpdateTaskInput): Task | undefined {
    const now = new Date();

    const task = this.findById(id);

    if (!task) return undefined;

    if (input.title !== undefined) {
      task.title = input.title;
    }

    if (input.description === null) {
      delete task.description;
    } else if (input.description !== undefined) {
      task.description = input.description;
    }

    if (input.priority !== undefined) {
      task.priority = input.priority;
    }

    if (input.status !== undefined) {
      task.status = input.status;
    }

    task.updatedAt = now;

    this.taskRepository.save(task);

    return task;
  }

  findById(id: string): Task | undefined {
    return this.taskRepository.findById(id);
  }

  findAll(query: TaskQuery): Task[] {
    const options = this.mapQueryToSearchOptions(query);

    return this.taskRepository.findAll(options);
  }

  delete(id: string): boolean {
    return this.taskRepository.delete(id);
  }

  private mapQueryToSearchOptions(query: TaskQuery): TaskSearchOptions {
    return {
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(query.priority !== undefined ? { priority: query.priority } : {}),
      ...(query.sortBy !== undefined ? { sortBy: query.sortBy } : {}),
      ...(query.order !== undefined ? { order: query.order } : {}),
    };
  }
}
