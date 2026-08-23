import type { TaskRepository } from './task.repository';
import type { Task } from '../domain/task';
import { Injectable } from '@nestjs/common';
import type { TaskFilter } from './task.filter';

@Injectable()
export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>();

  save(task: Task): void {
    this.tasks.set(task.id, task);
  }
  findById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  findAll(filter: TaskFilter): Task[] {
    return Array.from(this.tasks.values()).filter(
      (task) =>
        (filter.status === undefined || task.status === filter.status) &&
        (filter.priority === undefined || task.priority === filter.priority),
    );
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }
}
