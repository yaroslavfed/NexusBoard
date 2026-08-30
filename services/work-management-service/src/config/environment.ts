import 'dotenv/config';

export interface Environment {
  databaseUrl: string;
  devUserId: string;
}

export function getEnvironment(): Environment {
  const databaseUrl = process.env.DATABASE_URL;
  const devUserId = process.env.DEV_USER_ID;

  if (!databaseUrl || !devUserId) {
    throw new Error('DATABASE_URL and DEV_USER_ID are required. Copy .env.example to .env');
  }

  return { databaseUrl, devUserId };
}
