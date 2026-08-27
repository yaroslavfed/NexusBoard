import type { TaskStatus } from './task-status';
import type { TaskPriority } from './task-priority';

export interface Task {
  readonly id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  readonly createdAt: Date;
  updatedAt: Date;
}
