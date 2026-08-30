import { Injectable, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TaskEntity } from './task.entity';
import { UserEntity } from './user.entity';
import { PostgresTaskRepository } from './postgres-task.repository';
import { DevCurrentUserService } from './dev-current-user.service';
import { getEnvironment } from '../../../config/environment';
import { CURRENT_USER_SERVICE, TASK_REPOSITORY } from '../../../tasks/task.constants';

@Injectable()
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
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: getEnvironment().databaseUrl,
      entities: [TaskEntity, UserEntity],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([TaskEntity, UserEntity]),
  ],
  providers: [
    PostgresTaskRepository,
    DevCurrentUserService,
    DevUserBootstrap,
    { provide: TASK_REPOSITORY, useExisting: PostgresTaskRepository },
    { provide: CURRENT_USER_SERVICE, useExisting: DevCurrentUserService },
  ],
  exports: [TASK_REPOSITORY, CURRENT_USER_SERVICE],
})
export class PersistenceModule {}
