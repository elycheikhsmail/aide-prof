import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import path from 'path';

// Charger le fichier .env approprié selon NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.development';
const envPath = path.resolve(process.cwd(), envFile);
console.log(`🔧 Drizzle Config: Loading env from ${envPath} (NODE_ENV=${process.env.NODE_ENV})`);
config({ path: envPath, override: true });

console.log(`🔌 Drizzle Config: Database URL is ${process.env.DATABASE_URL?.split('@')[1]}`);

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
