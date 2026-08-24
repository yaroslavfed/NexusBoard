import type { TaskStatus } from '../tasks/domain/task-status';
import type { TaskPriority } from '../tasks/domain/task-priority';

export const TASK_SORT_FIELDS = ['createdAt', 'priority'] as const;
export type TaskSortField = (typeof TASK_SORT_FIELDS)[number];

export const SORT_ORDERS = ['asc', 'desc'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export interface TaskSearchOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: TaskSortField;
  order?: SortOrder;
}
