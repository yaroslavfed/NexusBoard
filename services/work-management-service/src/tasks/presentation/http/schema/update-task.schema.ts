import { z } from 'zod';
import { TASK_PRIORITIES } from '../../../domain/task-priority';
import { TASK_WORKFLOW_STATUSES } from '../../../domain/task-workflow-status';
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const updateTaskSchema = z.object({
  expectedVersion: z.number().int().positive(),
  title: z.string().trim().min(1).optional(),
  description: z.string().nullable().optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  workflowStatus: z.enum(TASK_WORKFLOW_STATUSES).optional(),
  plannedStartDate: date.nullable().optional(),
  dueDate: date.nullable().optional(),
});
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
