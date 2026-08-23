import { z } from 'zod';
import { TASK_PRIORITIES } from '../domain/task-priority';

export const createTaskSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  priority: z.enum(TASK_PRIORITIES),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
