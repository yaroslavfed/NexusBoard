import { z } from 'zod';
import { TASK_STATUSES } from '../domain/task-status';
import { TASK_PRIORITIES } from '../domain/task-priority';

export const taskQuerySchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
});

export type TaskQuery = z.infer<typeof taskQuerySchema>;
