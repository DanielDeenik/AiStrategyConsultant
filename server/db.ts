import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure websocket for Neon's serverless driver
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool with proper error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

// Add error handling for the pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize Drizzle with the pool
export const db = drizzle(pool, { schema });

// Healthcheck function to verify database connection
export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  }
}