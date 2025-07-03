import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

if (typeof window !== 'undefined') {
  throw new Error('db can only be used on the server');
}

const tursoClient = createClient({
  url: 'libsql://i-med-koushikchodraju.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTE1NTI3NzAsImlkIjoiYjM0ZDgzODUtMmI4ZS00YjE4LWJjZmUtMGM4MTE1NmExOWQzIiwicmlkIjoiNjU0YWVlMDItYThkOS00YWU3LWI4N2YtNjVlNzYzZjUzNjNiIn0.FItiK0lRowf2rzzscmcJsr4RCQDDdAaKuRTnYRhO2LDAAXG_8aM70AHNetAU0zKFaTQ47UbB04QFwBUurrb1Bw'
});
const db = drizzle(tursoClient);

export { db };

// Safe SQL execution function
export async function executeSql(sql: string) {
  const client = createClient({
    url: 'file:./local.db',
  });
  return await client.execute(sql);
} 