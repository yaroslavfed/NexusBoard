import { DataSource } from 'typeorm';
import { GenericContainer, Wait } from 'testcontainers';
import { CreateFoundation1710000000000 } from '../src/infrastructure/persistence/typeorm/migrations/1710000000000-create-foundation';

describe('PostgreSQL foundation', () => {
  it('применяет migration users и tasks', async () => {
    const container = await new GenericContainer('postgres:17-alpine')
      .withEnvironment({
        POSTGRES_DB: 'nexusboard',
        POSTGRES_USER: 'nexusboard',
        POSTGRES_PASSWORD: 'nexusboard',
      })
      .withExposedPorts(5432)
      .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections', 2))
      .start();
    const dataSource = new DataSource({
      type: 'postgres',
      url: `postgresql://nexusboard:nexusboard@${container.getHost()}:${container.getMappedPort(5432)}/nexusboard`,
      migrations: [CreateFoundation1710000000000],
    });

    try {
      await dataSource.initialize();
      await dataSource.runMigrations();

      const tables: unknown = await dataSource.query(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
      );

      expect(tables).toEqual([
        { tablename: 'migrations' },
        { tablename: 'tasks' },
        { tablename: 'users' },
      ]);
    } finally {
      if (dataSource.isInitialized) {
        await dataSource.destroy();
      }

      await container.stop();
    }
  }, 60_000);
});
