import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Create the connection to your Neon database
const sql = neon(process.env.DATABASE_URL!);

// Create the Drizzle instance with our schema
export const db = drizzle(sql, { schema });

// Export the schema for use in other files
export * from './schema';

// Legacy alias for backward compatibility
export const stacks = schema.recipeStacks;
