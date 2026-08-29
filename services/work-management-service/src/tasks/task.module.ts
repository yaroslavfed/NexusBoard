import { Module } from '@nestjs/common';
import { PersistenceModule } from '../infrastructure/persistence/typeorm/persistence.module';
import { TaskService } from './application/task.service';
import { TaskController } from './presentation/http/controllers/task.controller';

@Module({ imports: [PersistenceModule], controllers: [TaskController], providers: [TaskService] })
export class TaskModule {}
