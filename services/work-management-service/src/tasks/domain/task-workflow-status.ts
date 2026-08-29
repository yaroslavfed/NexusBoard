export const TASK_WORKFLOW_STATUSES = [
  'Todo',
  'In Progress',
  'Resolved',
  'Closed',
  'Rejected',
] as const;

export type TaskWorkflowStatus = (typeof TASK_WORKFLOW_STATUSES)[number];
