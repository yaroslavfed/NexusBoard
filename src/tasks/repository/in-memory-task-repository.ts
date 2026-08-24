import type { TaskRepository } from './task.repository';
import type { Task } from '../domain/task';
import { Injectable } from '@nestjs/common';
import type { TaskSearchOptions } from '../../application/task-search-options';
import { TASK_PRIORITY_WEIGHT } from '../domain/task-priority';

@Injectable()
export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>();

  save(task: Task): void {
    this.tasks.set(task.id, task);
  }
  findById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  findAll(options: TaskSearchOptions): Task[] {
    let tasks = Array.from(this.tasks.values()).filter(
      (task) =>
        (options.status === undefined || task.status === options.status) &&
        (options.priority === undefined || task.priority === options.priority),
    );

    if (options.sortBy !== undefined) {
      tasks = tasks.toSorted((a, b) => {
        let comparison: number;

        if (options.sortBy === 'createdAt') {
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
        } else {
          comparison = TASK_PRIORITY_WEIGHT[a.priority] - TASK_PRIORITY_WEIGHT[b.priority];
        }

        return options.order === 'desc' ? -comparison : comparison;
      });
    }

    return tasks;
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }
}
