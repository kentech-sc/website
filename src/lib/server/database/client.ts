import { AsyncLocalStorage } from 'node:async_hooks';

import { attachDatabasePool } from '@vercel/functions';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema.js';

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export type Database = NodePgDatabase<typeof schema>;

let pool: Pool | undefined;
let database: Database | undefined;
const transactionStorage = new AsyncLocalStorage<Database>();

export async function initDatabase(connectionString: string): Promise<void> {
	if (database) return;

	pool = new Pool({
		connectionString,
		max: 10,
		idleTimeoutMillis: 20_000,
		connectionTimeoutMillis: 10_000
	});
	attachDatabasePool(pool);
	database = drizzle(pool, { schema });
	await pool.query('select 1');
}

export function getDatabase(): Database {
	const transaction = transactionStorage.getStore();
	if (transaction) return transaction;
	if (!database) throw new Error('Database has not been initialized.');
	return database;
}

export async function closeDatabase(): Promise<void> {
	await pool?.end();
	pool = undefined;
	database = undefined;
}

export async function transaction<T>(callback: () => Promise<T>): Promise<T> {
	const db = getDatabase();
	return await db.transaction(async (tx) => {
		return await transactionStorage.run(tx as Database, callback);
	});
}
