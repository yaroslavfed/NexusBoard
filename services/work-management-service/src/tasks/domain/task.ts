import type { TaskLifecycleStatus } from './task-lifecycle-status';
import type { TaskPriority } from './task-priority';
import type { TaskWorkflowStatus } from './task-workflow-status';

export interface Task {
  readonly id: string;
  title: string;
  description?: string;
  workflowStatus: TaskWorkflowStatus;
  lifecycleStatus: TaskLifecycleStatus;
  priority: TaskPriority;
  readonly authorId: string;
  assigneeId?: string;
  projectId?: string;
  plannedStartDate?: string;
  dueDate?: string;
  readonly createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
  readonly version: number;
}
