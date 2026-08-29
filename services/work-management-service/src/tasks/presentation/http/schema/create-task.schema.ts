import { z } from 'zod';
import { TASK_PRIORITIES } from '../../../domain/task-priority';
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const createTaskSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  priority: z.enum(TASK_PRIORITIES),
  plannedStartDate: date.optional(),
  dueDate: date.optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
