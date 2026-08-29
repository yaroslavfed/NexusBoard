import { z } from 'zod';
import { TASK_PRIORITIES } from '../../../domain/task-priority';
import { TASK_WORKFLOW_STATUSES } from '../../../domain/task-workflow-status';
import { SORT_ORDERS, TASK_SORT_FIELDS } from '../../../application/task-search-options';
export const taskQuerySchema = z.object({
  workflowStatus: z.enum(TASK_WORKFLOW_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  sortBy: z.enum(TASK_SORT_FIELDS).optional(),
  order: z.enum(SORT_ORDERS).optional(),
});
export type TaskQuery = z.infer<typeof taskQuerySchema>;
