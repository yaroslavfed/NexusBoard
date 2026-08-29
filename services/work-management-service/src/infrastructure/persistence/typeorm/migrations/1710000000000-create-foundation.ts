import type { MigrationInterface, QueryRunner } from 'typeorm';
export class CreateFoundation1710000000000 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query(`CREATE TABLE users (id uuid PRIMARY KEY, created_at timestamptz NOT NULL)`);
    await q.query(
      `CREATE TABLE tasks (id uuid PRIMARY KEY, title varchar NOT NULL, description text NULL, workflow_status varchar NOT NULL, lifecycle_status varchar NOT NULL, priority varchar NOT NULL, author_id uuid NOT NULL REFERENCES users(id), assignee_id uuid NULL REFERENCES users(id), project_id uuid NULL, planned_start_date date NULL, due_date date NULL, created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL, archived_at timestamptz NULL, version integer NOT NULL CHECK (version > 0), CHECK (due_date IS NULL OR planned_start_date IS NULL OR due_date >= planned_start_date), CHECK (workflow_status IN ('Todo','In Progress','Resolved','Closed','Rejected')), CHECK (lifecycle_status IN ('Active','Archived')))`,
    );
  }
  async down(q: QueryRunner) {
    await q.query('DROP TABLE tasks');
    await q.query('DROP TABLE users');
  }
}
