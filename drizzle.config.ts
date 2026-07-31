import { defineConfig } from 'drizzle-kit';

if (!process.env.DIRECT_DATABASE_URL) {
	throw new Error('DIRECT_DATABASE_URL is required to run database migrations.');
}

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/lib/server/database/schema.ts',
	out: './drizzle',
	dbCredentials: {
		url: process.env.DIRECT_DATABASE_URL
	},
	schemaFilter: ['app', 'private'],
	strict: true,
	verbose: true
});
