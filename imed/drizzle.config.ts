import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

export default {
  schema: './src/lib/db/schema/*',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './local.db'
  },
} satisfies Config; 