import type { Task } from '../../domain/task';
import type { TaskSearchOptions } from '../task-search-options';
export interface TaskUpdate {
  title?: string;
  description?: string | null;
  priority?: Task['priority'];
  workflowStatus?: Task['workflowStatus'];
  plannedStartDate?: string | null;
  dueDate?: string | null;
  updatedAt: Date;
}
export type VersionedMutationResult =
  { kind: 'updated'; task: Task } | { kind: 'not-found' } | { kind: 'version-conflict' };
export type VersionedDeleteResult =
  Exclude<VersionedMutationResult, { kind: 'updated' }> | { kind: 'deleted' };
export interface TaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: string): Promise<Task | undefined>;
  findAll(options: TaskSearchOptions): Promise<Task[]>;
  update(id: string, expectedVersion: number, update: TaskUpdate): Promise<VersionedMutationResult>;
  archive(id: string, expectedVersion: number, archivedAt: Date): Promise<VersionedMutationResult>;
  hardDelete(id: string, expectedVersion: number): Promise<VersionedDeleteResult>;
}
