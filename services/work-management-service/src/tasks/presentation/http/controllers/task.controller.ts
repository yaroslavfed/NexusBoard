import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TaskService } from '../../../application/task.service';
import { ZodValidationPipe } from '../zod-validation.pipe';
import { createTaskSchema, type CreateTaskInput } from '../schema/create-task.schema';
import { updateTaskSchema, type UpdateTaskInput } from '../schema/update-task.schema';
import { taskQuerySchema, type TaskQuery } from '../schema/task-query.schema';
import {
  expectedVersionSchema,
  type ExpectedVersionInput,
} from '../schema/expected-version.schema';
@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly service: TaskService) {}
  @Post() create(@Body(new ZodValidationPipe(createTaskSchema)) input: CreateTaskInput) {
    return this.service.create(input);
  }
  @Get() findAll(@Query(new ZodValidationPipe(taskQuerySchema)) query: TaskQuery) {
    return this.service.findAll(query);
  }
  @Get(':id') findById(@Param('id') id: string) {
    return this.service.findById(id);
  }
  @Patch(':id') update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTaskSchema)) input: UpdateTaskInput,
  ) {
    return this.service.update(id, input);
  }
  @Post(':id/archive') archive(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(expectedVersionSchema)) input: ExpectedVersionInput,
  ) {
    return this.service.archive(id, input.expectedVersion);
  }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) hardDelete(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(expectedVersionSchema)) input: ExpectedVersionInput,
  ) {
    return this.service.hardDelete(id, input.expectedVersion);
  }
}
