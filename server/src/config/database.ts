import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env.js';
import * as schema from '../db/schema/index.js';

// Connection for queries
console.log(`🔌 Connecting to database: ${env.DATABASE_URL.split('@')[1]}`); // Log host/port only for security
const queryClient = postgres(env.DATABASE_URL);

// Drizzle instance with schema
export const db = drizzle(queryClient, { schema });

// Export type for use in repositories
export type Database = typeof db;
