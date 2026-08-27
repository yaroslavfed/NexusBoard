export const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};
