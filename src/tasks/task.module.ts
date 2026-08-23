import { Module } from '@nestjs/common';
import { TaskService } from './services/task.service';
import { InMemoryTaskRepository } from './repository/in-memory-task-repository';
import { TaskController } from './controllers/task.controller';
import { TASK_REPOSITORY } from './task.constants';

@Module({
  imports: [],
  controllers: [TaskController],
  providers: [TaskService, { provide: TASK_REPOSITORY, useClass: InMemoryTaskRepository }],
})
export class TaskModule {}
