import { Client } from 'pg';

const connectionString = process.env.DIRECT_DATABASE_URL;
if (!connectionString) {
	throw new Error('DIRECT_DATABASE_URL is required.');
}

const client = new Client({ connectionString });

try {
	await client.connect();
	const { rows } = await client.query<{
		table_schema: string;
		table_name: string;
		rls_enabled: boolean;
	}>(`
		select
			namespace.nspname as table_schema,
			class.relname as table_name,
			class.relrowsecurity as rls_enabled
		from pg_class as class
		join pg_namespace as namespace on namespace.oid = class.relnamespace
		where namespace.nspname in ('app', 'private')
			and class.relkind = 'r'
		order by namespace.nspname, class.relname
	`);

	const expectedTableCount = 17;
	const rlsTableCount = rows.filter(({ rls_enabled }) => rls_enabled).length;
	console.log({
		connected: true,
		tableCount: rows.length,
		rlsTableCount
	});

	if (rows.length !== expectedTableCount || rlsTableCount !== expectedTableCount) {
		process.exitCode = 1;
	}
} catch (error) {
	const databaseError = error as Error & {
		code?: string;
		detail?: string;
		hint?: string;
	};
	console.error({
		connected: false,
		name: databaseError.name,
		code: databaseError.code,
		message: databaseError.message,
		detail: databaseError.detail,
		hint: databaseError.hint
	});
	process.exitCode = 1;
} finally {
	await client.end().catch(() => undefined);
}
