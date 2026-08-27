import type { Task } from '../../domain/task';
import type { TaskSearchOptions } from '../task-search-options';

export interface TaskRepository {
  save(task: Task): void;
  findById(id: string): Task | undefined;
  findAll(options: TaskSearchOptions): Task[];
  delete(id: string): boolean;
}
