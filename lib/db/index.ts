import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL || ""

export const hasDatabaseUrl = Boolean(connectionString && connectionString.trim().length > 0)

export const pool = new Pool({
  connectionString: hasDatabaseUrl ? connectionString : undefined,
  ssl: connectionString.includes("sslmode=require") || connectionString.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 3000,
})

export const db = drizzle(pool, { schema })
