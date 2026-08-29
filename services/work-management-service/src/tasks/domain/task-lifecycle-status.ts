export const TASK_LIFECYCLE_STATUSES = ['Active', 'Archived'] as const;

export type TaskLifecycleStatus = (typeof TASK_LIFECYCLE_STATUSES)[number];
