import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { AppModule } from '../src/app.module';

interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
}

describe('Tasks API (e2e)', () => {
  let app: INestApplication<Server>;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication<INestApplication<Server>>();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('создаёт, находит, обновляет, фильтрует и удаляет задачу', async () => {
    const created = await request(server)
      .post('/tasks')
      .send({
        title: '  Подготовить релиз  ',
        description: 'Проверить changelog',
        priority: 'High',
      })
      .expect(201);
    const createdTask = created.body as unknown as TaskResponse;

    expect(typeof createdTask.id).toBe('string');
    expect(createdTask.title).toBe('Подготовить релиз');
    expect(createdTask.description).toBe('Проверить changelog');
    expect(createdTask.priority).toBe('High');
    expect(createdTask.status).toBe('Todo');

    const { id } = createdTask;
    const found = await request(server).get(`/tasks/${id}`).expect(200);
    expect(found.body as unknown).toEqual(createdTask);

    const updated = await request(server)
      .patch(`/tasks/${id}`)
      .send({ status: 'Done', description: null })
      .expect(200);

    const updatedTask = updated.body as unknown as TaskResponse;
    expect(updatedTask).toMatchObject({ id, status: 'Done' });
    expect(updatedTask).not.toHaveProperty('description');

    const filtered = await request(server)
      .get('/tasks')
      .query({ status: 'Done', priority: 'High', sortBy: 'priority', order: 'desc' })
      .expect(200);
    expect(filtered.body as unknown).toEqual([expect.objectContaining({ id })]);

    await request(server).delete(`/tasks/${id}`).expect(204);
    const missing = await request(server).get(`/tasks/${id}`).expect(404);
    expect(missing.body as unknown).toEqual({
      message: `Task ${id} not found`,
      error: 'Not Found',
      statusCode: 404,
    });
  });

  it('возвращает 400 для некорректного тела и query-параметров', async () => {
    await request(server).post('/tasks').send({ title: '   ', priority: 'Urgent' }).expect(400);

    await request(server).get('/tasks').query({ order: 'desc' }).expect(400);
  });

  it('возвращает 404 при обновлении и удалении отсутствующей задачи', async () => {
    await request(server).patch('/tasks/missing-id').send({ status: 'Done' }).expect(404);
    await request(server).delete('/tasks/missing-id').expect(404);
  });
});
