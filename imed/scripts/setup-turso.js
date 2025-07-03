#!/usr/bin/env node

/**
 * This script sets up the Turso database with initial schema and seed data
 */

const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Use environment variables or hardcoded values for testing
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || 'libsql://imed-db-koushikchodraju.turso.io';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiI4MmNmNmIwMC1kY2U3LTRhYjYtOTAwYy1mNDNjMThjNzA3MDgiLCJpYXQiOjE3NTEzNzkwNzksInJpZCI6ImYyZDk0YWE3LWFhMGItNDg2Zi04N2NhLWM1MWU2YzA5YWU2NiJ9.p0eAq9ug1QOvNKFMSZLqpT12i8vJ-_ivck5tCopG-DY3bPZJEN2xGM5FQFpUTQikFtnSJkdbWe7k1ZOBsYWNBQ';

// Validate credentials
if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error('Missing required credentials: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
  process.exit(1);
}

console.log('Using Turso database URL:', TURSO_DATABASE_URL);

// Create a client
const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN
});

// Path to our schema and seed SQL files
const schemaPath = path.join(__dirname, '..', 'drizzle', '0000_magenta_hobgoblin.sql');
const seedPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'seed.sql');

// Helper function to read SQL file contents
function readSqlFile(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Error reading file ${filepath}:`, error);
    return null;
  }
}

// Helper function to execute SQL statements
async function executeSql(sql) {
  if (!sql) return;
  
  // Split SQL into separate statements
  const statements = sql
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .split(';')
    .filter(stmt => stmt.trim());
  
  for (const statement of statements) {
    try {
      console.log(`Executing SQL: ${statement.substring(0, 50)}...`);
      await client.execute(statement);
    } catch (error) {
      console.error('Error executing SQL:', error);
      console.error('Statement:', statement);
    }
  }
}

// Main function
async function setup() {
  console.log('Setting up Turso database...');
  
  try {
    // Create schema tables directly
    console.log('Creating database schema...');
    const schemaContent = readSqlFile(schemaPath);
    if (schemaContent) {
      await executeSql(schemaContent);
      console.log('Schema created successfully.');
    } else {
      console.error('Schema file not found or empty.');
      return;
    }
    
    // Seed data
    console.log('Seeding initial data...');
    const seedContent = readSqlFile(seedPath);
    if (seedContent) {
      await executeSql(seedContent);
      console.log('Seed data inserted successfully.');
    } else {
      console.log('Seed file not found or empty, skipping.');
    }
    
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Promote a user to admin by email
async function promoteUserToAdmin(email) {
  const { getUserByEmail, setUserRole } = require('../src/lib/services/turso-user-service');
  const user = await getUserByEmail(email);
  if (!user) {
    console.error('User not found:', email);
    return;
  }
  await setUserRole(user.uid, 'admin');
  console.log(`User ${email} promoted to admin.`);
}

// If this script is run with --promote-admin <email>, promote that user
if (process.argv.includes('--promote-admin')) {
  const email = process.argv[process.argv.indexOf('--promote-admin') + 1];
  if (!email) {
    console.error('Please provide an email after --promote-admin');
    process.exit(1);
  }
  promoteUserToAdmin(email).then(() => process.exit(0));
}

// Run the setup
setup().catch(console.error); 