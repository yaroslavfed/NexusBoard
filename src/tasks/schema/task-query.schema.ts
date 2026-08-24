import { z } from 'zod';
import { TASK_STATUSES } from '../domain/task-status';
import { TASK_PRIORITIES } from '../domain/task-priority';
import { SORT_ORDERS, TASK_SORT_FIELDS } from '../../application/task-search-options';

export const taskQuerySchema = z
  .object({
    status: z.enum(TASK_STATUSES).optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
    sortBy: z.enum(TASK_SORT_FIELDS).optional(),
    order: z.enum(SORT_ORDERS).optional(),
  })
  .refine((query) => query.order === undefined || query.sortBy !== undefined, {
    message: 'order requires sortBy',
    path: ['order'],
  });

export type TaskQuery = z.infer<typeof taskQuerySchema>;
