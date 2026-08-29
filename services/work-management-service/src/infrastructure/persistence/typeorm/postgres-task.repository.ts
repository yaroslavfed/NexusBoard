import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Task } from '../../../tasks/domain/task';
import type {
  TaskRepository,
  TaskUpdate,
  VersionedDeleteResult,
  VersionedMutationResult,
} from '../../../tasks/application/ports/task.repository';
import type { TaskSearchOptions } from '../../../tasks/application/task-search-options';
import { TaskEntity } from './task.entity';
@Injectable()
export class PostgresTaskRepository implements TaskRepository {
  constructor(@InjectRepository(TaskEntity) private readonly repo: Repository<TaskEntity>) {}
  private map(r: TaskEntity): Task {
    return {
      id: r.id,
      title: r.title,
      workflowStatus: r.workflowStatus as Task['workflowStatus'],
      lifecycleStatus: r.lifecycleStatus as Task['lifecycleStatus'],
      priority: r.priority as Task['priority'],
      authorId: r.authorId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      version: r.version,
      ...(r.description === null ? {} : { description: r.description }),
      ...(r.assigneeId === null ? {} : { assigneeId: r.assigneeId }),
      ...(r.projectId === null ? {} : { projectId: r.projectId }),
      ...(r.plannedStartDate === null ? {} : { plannedStartDate: r.plannedStartDate }),
      ...(r.dueDate === null ? {} : { dueDate: r.dueDate }),
      ...(r.archivedAt === null ? {} : { archivedAt: r.archivedAt }),
    };
  }
  async create(t: Task) {
    return this.map(
      await this.repo.save(
        this.repo.create({
          ...t,
          description: t.description ?? null,
          assigneeId: t.assigneeId ?? null,
          projectId: t.projectId ?? null,
          plannedStartDate: t.plannedStartDate ?? null,
          dueDate: t.dueDate ?? null,
          archivedAt: t.archivedAt ?? null,
        }),
      ),
    );
  }
  async findById(id: string) {
    const r = await this.repo.findOneBy({ id });
    return r ? this.map(r) : undefined;
  }
  async findAll(o: TaskSearchOptions) {
    const q = this.repo.createQueryBuilder('task');
    if (o.workflowStatus) q.andWhere('task.workflow_status=:workflowStatus', o);
    if (o.priority) q.andWhere('task.priority=:priority', o);
    return (await q.getMany()).map((x) => this.map(x));
  }
  async update(id: string, v: number, u: TaskUpdate): Promise<VersionedMutationResult> {
    const r = await this.repo
      .createQueryBuilder()
      .update(TaskEntity)
      .set({ ...u, version: () => 'version + 1' })
      .where('id=:id AND version=:v', { id, v })
      .returning('*')
      .execute();
    if (!r.affected) return this.missing(id);
    return { kind: 'updated', task: await this.updatedTask(id) };
  }
  async archive(id: string, v: number, at: Date): Promise<VersionedMutationResult> {
    const r = await this.repo
      .createQueryBuilder()
      .update(TaskEntity)
      .set({
        lifecycleStatus: 'Archived',
        archivedAt: at,
        updatedAt: at,
        version: () => 'version + 1',
      })
      .where('id=:id AND version=:v', { id, v })
      .returning('*')
      .execute();
    if (!r.affected) return this.missing(id);
    return { kind: 'updated', task: await this.updatedTask(id) };
  }
  async hardDelete(id: string, v: number): Promise<VersionedDeleteResult> {
    const r = await this.repo
      .createQueryBuilder()
      .delete()
      .where('id=:id AND version=:v', { id, v })
      .execute();
    return r.affected ? { kind: 'deleted' } : this.missing(id);
  }
  private async missing(
    id: string,
  ): Promise<Exclude<VersionedMutationResult, { kind: 'updated' }>> {
    return (await this.repo.existsBy({ id }))
      ? { kind: 'version-conflict' }
      : { kind: 'not-found' };
  }

  private async updatedTask(id: string): Promise<Task> {
    const task = await this.findById(id);

    if (!task) throw new Error(`Task ${id} disappeared after update`);

    return task;
  }
}
