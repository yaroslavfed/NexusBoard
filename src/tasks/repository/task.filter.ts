import type { TaskStatus } from '../domain/task-status';
import type { TaskPriority } from '../domain/task-priority';

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
}
