import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TaskService } from '../services/task.service';
import type { Task } from '../domain/task';
import { type CreateTaskInput, createTaskSchema } from '../schema/create-task.schema';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { ApiTags } from '@nestjs/swagger';
import { type UpdateTaskInput, updateTaskSchema } from '../schema/update-task.schema';
import { type TaskQuery, taskQuerySchema } from '../schema/task-query.schema';

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body(new ZodValidationPipe(createTaskSchema)) input: CreateTaskInput): Task {
    return this.taskService.create(input);
  }

  @Get(':id')
  findById(@Param('id') id: string): Task {
    const task = this.taskService.findById(id);

    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    return task;
  }

  @Get()
  findAll(@Query(new ZodValidationPipe(taskQuerySchema)) query: TaskQuery): Task[] {
    return this.taskService.findAll(query);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTaskSchema)) input: UpdateTaskInput,
  ): Task {
    const task = this.taskService.update(id, input);

    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    return task;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): void {
    const deleted = this.taskService.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Task ${id} not found`);
    }
  }
}
