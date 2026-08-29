import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity('tasks')
export class TaskEntity {
  @PrimaryColumn('uuid') id!: string;
  @Column() title!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ name: 'workflow_status' }) workflowStatus!: string;
  @Column({ name: 'lifecycle_status' }) lifecycleStatus!: string;
  @Column() priority!: string;
  @Column({ name: 'author_id', type: 'uuid' }) authorId!: string;
  @Column({ name: 'assignee_id', type: 'uuid', nullable: true }) assigneeId!: string | null;
  @Column({ name: 'project_id', type: 'uuid', nullable: true }) projectId!: string | null;
  @Column({ name: 'planned_start_date', type: 'date', nullable: true }) plannedStartDate!:
    string | null;
  @Column({ name: 'due_date', type: 'date', nullable: true }) dueDate!: string | null;
  @Column({ type: 'timestamptz', name: 'created_at' }) createdAt!: Date;
  @Column({ type: 'timestamptz', name: 'updated_at' }) updatedAt!: Date;
  @Column({ type: 'timestamptz', name: 'archived_at', nullable: true }) archivedAt!: Date | null;
  @Column({ type: 'integer' }) version!: number;
}
