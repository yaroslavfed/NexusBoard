import { Task } from '../domain/task';
import { TaskFilter } from './task.filter';

export interface TaskRepository {
  save(task: Task): void;
  findById(id: string): Task | undefined;
  findAll(filter: TaskFilter): Task[];
  delete(id: string): boolean;
}
