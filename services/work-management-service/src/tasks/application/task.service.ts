import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CURRENT_USER_SERVICE, TASK_REPOSITORY } from '../task.constants';
import type { Task } from '../domain/task';
import type { CreateTaskInput } from '../presentation/http/schema/create-task.schema';
import type { TaskQuery } from '../presentation/http/schema/task-query.schema';
import type { UpdateTaskInput } from '../presentation/http/schema/update-task.schema';
import type { CurrentUserService } from './ports/current-user.service';
import type {
  TaskRepository,
  TaskUpdate,
  VersionedDeleteResult,
  VersionedMutationResult,
} from './ports/task.repository';
@Injectable()
export class TaskService {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly repository: TaskRepository,
    @Inject(CURRENT_USER_SERVICE) private readonly user: CurrentUserService,
  ) {}
  async create(input: CreateTaskInput): Promise<Task> {
    const now = new Date();
    return this.repository.create({
      id: crypto.randomUUID(),
      title: input.title,
      priority: input.priority,
      workflowStatus: 'Todo',
      lifecycleStatus: 'Active',
      authorId: this.user.getUserId(),
      createdAt: now,
      updatedAt: now,
      version: 1,
      ...(input.description === undefined ? {} : { description: input.description }),
      ...(input.plannedStartDate === undefined ? {} : { plannedStartDate: input.plannedStartDate }),
      ...(input.dueDate === undefined ? {} : { dueDate: input.dueDate }),
    });
  }
  async findById(id: string) {
    const task = await this.repository.findById(id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return task;
  }
  findAll(q: TaskQuery) {
    return this.repository.findAll({
      ...(q.workflowStatus === undefined ? {} : { workflowStatus: q.workflowStatus }),
      ...(q.priority === undefined ? {} : { priority: q.priority }),
      ...(q.sortBy === undefined ? {} : { sortBy: q.sortBy }),
      ...(q.order === undefined ? {} : { order: q.order }),
    });
  }
  async update(id: string, input: UpdateTaskInput) {
    const task = await this.findById(id);
    if (task.workflowStatus === 'Closed' || task.workflowStatus === 'Rejected')
      throw new ConflictException('Terminal task cannot be changed');
    const update: TaskUpdate = {
      updatedAt: new Date(),
      ...(input.title === undefined ? {} : { title: input.title }),
      ...(input.description === undefined ? {} : { description: input.description }),
      ...(input.priority === undefined ? {} : { priority: input.priority }),
      ...(input.workflowStatus === undefined ? {} : { workflowStatus: input.workflowStatus }),
      ...(input.plannedStartDate === undefined ? {} : { plannedStartDate: input.plannedStartDate }),
      ...(input.dueDate === undefined ? {} : { dueDate: input.dueDate }),
    };
    return this.unwrap(await this.repository.update(id, input.expectedVersion, update), id);
  }
  async archive(id: string, version: number) {
    return this.unwrap(await this.repository.archive(id, version, new Date()), id);
  }
  async hardDelete(id: string, version: number) {
    const result = await this.repository.hardDelete(id, version);
    if (result.kind === 'deleted') return;
    this.fail(result, id);
  }
  private unwrap(result: VersionedMutationResult, id: string) {
    if (result.kind === 'updated') return result.task;
    this.fail(result, id);
  }
  private fail(
    result: Exclude<
      VersionedMutationResult | VersionedDeleteResult,
      { kind: 'updated' } | { kind: 'deleted' }
    >,
    id: string,
  ): never {
    if (result.kind === 'not-found') throw new NotFoundException(`Task ${id} not found`);
    throw new ConflictException(`Task ${id} has been changed`);
  }
}
