import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';
import { PostgresTaskRepository } from './postgres-task.repository';
import { DevCurrentUserService } from './dev-current-user.service';
import { TypeOrmTransactionRunner } from './typeorm-transaction-runner';
import {
  CURRENT_USER_SERVICE,
  TASK_REPOSITORY,
  TRANSACTION_RUNNER,
} from '../../../tasks/task.constants';
class DevUserBootstrap implements OnApplicationBootstrap {
  constructor(
    private readonly dataSource: DataSource,
    private readonly actor: DevCurrentUserService,
  ) {}
  async onApplicationBootstrap() {
    await this.dataSource
      .getRepository(UserEntity)
      .upsert({ id: this.actor.getUserId(), createdAt: new Date() }, ['id']);
  }
}
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url:
        process.env.DATABASE_URL ?? 'postgresql://nexusboard:nexusboard@localhost:5432/nexusboard',
      entities: [TaskEntity, UserEntity],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([TaskEntity, UserEntity]),
  ],
  providers: [
    PostgresTaskRepository,
    DevCurrentUserService,
    TypeOrmTransactionRunner,
    DevUserBootstrap,
    { provide: TASK_REPOSITORY, useExisting: PostgresTaskRepository },
    { provide: CURRENT_USER_SERVICE, useExisting: DevCurrentUserService },
    { provide: TRANSACTION_RUNNER, useExisting: TypeOrmTransactionRunner },
  ],
  exports: [TASK_REPOSITORY, CURRENT_USER_SERVICE, TRANSACTION_RUNNER],
})
export class PersistenceModule {}
