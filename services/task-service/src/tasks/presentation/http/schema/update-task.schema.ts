import { z } from 'zod';
import { TASK_PRIORITIES } from '../../../domain/task-priority';
import { TASK_STATUSES } from '../../../domain/task-status';

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().nullable().optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
