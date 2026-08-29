export const TASK_WORKFLOW_STATUSES = ['Todo', 'In Progress', 'Resolved', 'Closed', 'Rejected'] as const;
export const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const;
export const TASK_SORT_FIELDS = ['createdAt', 'priority'] as const;

export type TaskWorkflowStatus = (typeof TASK_WORKFLOW_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskSortField = (typeof TASK_SORT_FIELDS)[number];
export type SortOrder = 'asc' | 'desc';

export interface Task {
  id: string;
  title: string;
  description?: string;
  workflowStatus: TaskWorkflowStatus;
  lifecycleStatus: 'Active' | 'Archived';
  priority: TaskPriority;
  authorId: string;
  assigneeId?: string;
  projectId?: string;
  plannedStartDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  version: number;
}

export interface TaskQuery {
  workflowStatus?: TaskWorkflowStatus;
  priority?: TaskPriority;
  sortBy?: TaskSortField;
  order?: SortOrder;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  plannedStartDate?: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  expectedVersion: number;
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  workflowStatus?: TaskWorkflowStatus;
  plannedStartDate?: string | null;
  dueDate?: string | null;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiError extends Error {
  constructor(readonly status: number) { super(`Request failed with status ${status}`); }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!response.ok) {
    throw new ApiError(response.status);
  }

  return response.status === 204 ? (undefined as T) : (await response.json()) as T;
}

export const tasksApi = {
  findAll(query: TaskQuery): Promise<Task[]> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params.set(key, value);
    }
    const suffix = params.size ? `?${params.toString()}` : '';
    return request<Task[]>(`/tasks${suffix}`);
  },
  findById(id: string): Promise<Task> {
    return request<Task>(`/tasks/${encodeURIComponent(id)}`);
  },
  create(input: CreateTaskInput): Promise<Task> {
    return request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) });
  },
  update(id: string, input: UpdateTaskInput): Promise<Task> {
    return request<Task>(`/tasks/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  archive(id: string, expectedVersion: number): Promise<Task> {
    return request<Task>(`/tasks/${encodeURIComponent(id)}/archive`, {
      method: 'POST', body: JSON.stringify({ expectedVersion }),
    });
  },
};
