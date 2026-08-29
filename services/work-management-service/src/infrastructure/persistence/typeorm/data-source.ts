import { DataSource } from 'typeorm';
import { CreateFoundation1710000000000 } from './migrations/1710000000000-create-foundation';
import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

export default new DataSource({
  type: 'postgres',
  url: databaseUrl,
  entities: [TaskEntity, UserEntity],
  migrations: [CreateFoundation1710000000000],
});
