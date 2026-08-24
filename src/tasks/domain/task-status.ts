export const TASK_STATUSES = ['Todo', 'In Progress', 'Done'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
