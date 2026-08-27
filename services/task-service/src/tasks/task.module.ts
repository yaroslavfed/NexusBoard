import { Module } from '@nestjs/common';
import { TaskService } from './application/task.service';
import { InMemoryTaskRepository } from './infrastructure/repository/in-memory-task-repository';
import { TaskController } from './presentation/http/controllers/task.controller';
import { TASK_REPOSITORY } from './task.constants';

@Module({
  imports: [],
  controllers: [TaskController],
  providers: [TaskService, { provide: TASK_REPOSITORY, useClass: InMemoryTaskRepository }],
})
export class TaskModule {}
