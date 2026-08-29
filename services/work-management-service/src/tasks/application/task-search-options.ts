import type { TaskPriority } from '../domain/task-priority';
import type { TaskWorkflowStatus } from '../domain/task-workflow-status';

export const TASK_SORT_FIELDS = ['createdAt', 'priority'] as const;
export type TaskSortField = (typeof TASK_SORT_FIELDS)[number];

export const SORT_ORDERS = ['asc', 'desc'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export interface TaskSearchOptions {
  workflowStatus?: TaskWorkflowStatus | undefined;
  priority?: TaskPriority | undefined;
  sortBy?: TaskSortField | undefined;
  order?: SortOrder | undefined;
}
