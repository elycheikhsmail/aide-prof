import { config } from 'dotenv';
import path from 'path';

// Charger le fichier .env approprié selon NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.development';
const envPath = path.resolve(process.cwd(), envFile);
console.log(`🔧 Loading env from: ${envPath} (NODE_ENV=${process.env.NODE_ENV})`);
config({ path: envPath, override: true });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL!,
  SESSION_SECRET: process.env.SESSION_SECRET || 'default-secret-change-me',
  SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10),
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || 'localhost',
  MINIO_PORT: parseInt(process.env.MINIO_PORT || '9000', 10),
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY!,
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY!,
  MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME || 'aide-prof-pdfs',
  MINIO_USE_SSL: process.env.MINIO_USE_SSL === 'true',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY'] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
