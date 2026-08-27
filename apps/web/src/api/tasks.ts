export const TASK_STATUSES = ['Todo', 'In Progress', 'Done'] as const;
export const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const;
export const TASK_SORT_FIELDS = ['createdAt', 'priority'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskSortField = (typeof TASK_SORT_FIELDS)[number];
export type SortOrder = 'asc' | 'desc';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

export interface TaskQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: TaskSortField;
  order?: SortOrder;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
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
  delete(id: string): Promise<void> {
    return request<void>(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};
