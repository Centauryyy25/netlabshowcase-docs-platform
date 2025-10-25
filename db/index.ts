import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as authSchema from './schema/auth';
import * as labsSchema from './schema/labs';

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...authSchema, ...labsSchema },
});

export { authSchema, labsSchema };
// Re-export individual tables for convenient imports like `from '@/db'`
export { labs, labFiles } from './schema/labs';
export { user, session, account, verification } from './schema/auth';
