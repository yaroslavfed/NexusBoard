import { DataSource } from 'typeorm';
import { getEnvironment } from '../../../config/environment';
import { CreateFoundation1710000000000 } from './migrations/1710000000000-create-foundation';
import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';

export default new DataSource({
  type: 'postgres',
  url: getEnvironment().databaseUrl,
  entities: [TaskEntity, UserEntity],
  migrations: [CreateFoundation1710000000000],
});
