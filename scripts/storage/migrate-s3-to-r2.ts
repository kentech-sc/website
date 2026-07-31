import { createHash } from 'node:crypto';

import {
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3';
import DOMPurify from 'isomorphic-dompurify';
import { Client } from 'pg';

interface FileManifestEntry {
	id: string;
	key: string;
	name: string;
	size: number;
	mime: string;
}

interface ArticleContent {
	id: string;
	content: string;
}

const argumentsSet = new Set(process.argv.slice(2));
const execute = argumentsSet.has('--execute');
const confirmTargetArgument = process.argv
	.slice(2)
	.find((argument) => argument.startsWith('--confirm-target='));
const confirmedTarget = confirmTargetArgument?.slice('--confirm-target='.length);

if (argumentsSet.has('--help')) {
	const help = `
S3-compatible object storage migration

Dry-run (read-only):
  npm run storage:migrate

Copy, verify, and rewrite embedded image URLs:
  npm run storage:migrate -- --execute --confirm-target=<supabase-project-ref>

The command never deletes source objects.
`;
	await new Promise<void>((resolve) => process.stdout.write(help, () => resolve()));
	process.exit(0);
}

function requiredEnvironmentVariable(name: string): string {
	const value = process.env[name]?.trim();
	if (!value) throw new Error(`${name} is required.`);
	return value;
}

function normalizeBaseUrl(value: string, name: string): string {
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		throw new Error(`${name} must be a valid absolute URL.`);
	}

	if (url.protocol !== 'https:' && url.protocol !== 'http:') {
		throw new Error(`${name} must use HTTP or HTTPS.`);
	}
	if (url.username || url.password || url.search || url.hash) {
		throw new Error(`${name} must not contain credentials, a query string, or a fragment.`);
	}

	url.pathname = url.pathname.replace(/\/+$/, '');
	return url.href.replace(/\/$/, '');
}

function endpointTargetsBucket(endpoint: string, bucket: string): boolean {
	const url = new URL(endpoint);
	const pathBucket = decodeURIComponent(url.pathname).split('/').filter(Boolean).at(-1);
	return pathBucket === bucket || url.hostname.toLowerCase().startsWith(`${bucket.toLowerCase()}.`);
}

function targetReference(connectionString: string): string {
	const url = new URL(connectionString);
	const username = decodeURIComponent(url.username);
	const poolerMatch = /^postgres\.([a-z0-9]+)$/i.exec(username);
	const directMatch = /^db\.([a-z0-9]+)\.supabase\.co$/i.exec(url.hostname);
	return poolerMatch?.[1] ?? directMatch?.[1] ?? `${url.hostname}-${url.pathname.slice(1)}`;
}

function encodeObjectKey(key: string): string {
	return key
		.replace(/^\/+/, '')
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/');
}

function publicObjectUrl(publicBaseUrl: string, key: string): string {
	return `${publicBaseUrl}/${encodeObjectKey(key)}`;
}

function sha256(buffer: Uint8Array): string {
	return createHash('sha256').update(buffer).digest('hex');
}

async function responseBody(response: { Body?: { transformToByteArray(): Promise<Uint8Array> } }) {
	if (!response.Body) throw new Error('Object response did not contain a body.');
	return await response.Body.transformToByteArray();
}

function isNotFound(error: unknown): boolean {
	if (typeof error !== 'object' || error === null) return false;
	const status =
		'$metadata' in error && typeof error.$metadata === 'object' && error.$metadata !== null
			? (error.$metadata as { httpStatusCode?: number }).httpStatusCode
			: undefined;
	const name = 'name' in error ? error.name : undefined;
	return status === 404 || name === 'NotFound' || name === 'NoSuchKey';
}

async function objectExists(
	client: S3Client,
	bucket: string,
	entry: FileManifestEntry
): Promise<boolean> {
	try {
		const result = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: entry.key }));
		if (result.ContentLength !== entry.size) {
			throw new Error(
				`${entry.key}: object size ${result.ContentLength ?? 'unknown'} does not match DB size ${entry.size}.`
			);
		}
		return true;
	} catch (error) {
		if (isNotFound(error)) return false;
		throw error;
	}
}

async function getObject(client: S3Client, bucket: string, key: string): Promise<Uint8Array> {
	return await responseBody(await client.send(new GetObjectCommand({ Bucket: bucket, Key: key })));
}

function keyFromImageSource(source: string, knownKeys: string[]): string | undefined {
	let pathname: string;
	try {
		pathname = decodeURIComponent(new URL(source).pathname).replace(/^\/+/, '');
	} catch {
		return undefined;
	}
	return knownKeys.find((key) => pathname === key || pathname.endsWith(`/${key}`));
}

function rewriteEmbeddedImages(
	content: string,
	fileByKey: Map<string, FileManifestEntry>,
	newPublicBaseUrl: string
): { content: string; imageCount: number } {
	const body = DOMPurify.sanitize(content, { RETURN_DOM: true }) as HTMLBodyElement;
	const imageKeys = Array.from(fileByKey.values())
		.filter((entry) => entry.mime.startsWith('image/'))
		.map((entry) => entry.key);
	let imageCount = 0;

	for (const image of Array.from(body.querySelectorAll('img'))) {
		const source = image.getAttribute('src')?.trim();
		if (!source) continue;
		const key = keyFromImageSource(source, imageKeys);
		if (!key) throw new Error(`Embedded image URL is not represented in file_metas: ${source}`);
		const file = fileByKey.get(key);
		if (!file) throw new Error(`Embedded image key is missing from file_metas: ${key}`);

		image.setAttribute('src', publicObjectUrl(newPublicBaseUrl, key));
		image.setAttribute('data-file-id', file.id);
		imageCount += 1;
	}

	return { content: body.innerHTML, imageCount };
}

const databaseUrl = requiredEnvironmentVariable('DIRECT_DATABASE_URL');
const sourceBucket = requiredEnvironmentVariable('STORAGE_SOURCE_BUCKET');
const sourceEndpoint = normalizeBaseUrl(
	requiredEnvironmentVariable('STORAGE_SOURCE_ENDPOINT'),
	'STORAGE_SOURCE_ENDPOINT'
);
const sourceRegion = requiredEnvironmentVariable('STORAGE_SOURCE_REGION');
const sourceAccessKeyId = requiredEnvironmentVariable('STORAGE_SOURCE_ACCESS_KEY_ID');
const sourceSecretAccessKey = requiredEnvironmentVariable('STORAGE_SOURCE_SECRET_ACCESS_KEY');
const sourceSessionToken = process.env.STORAGE_SOURCE_SESSION_TOKEN?.trim() || undefined;
const targetBucket = requiredEnvironmentVariable('STORAGE_BUCKET');
const targetEndpoint = normalizeBaseUrl(
	requiredEnvironmentVariable('STORAGE_ENDPOINT'),
	'STORAGE_ENDPOINT'
);
const targetPublicBaseUrl = normalizeBaseUrl(
	requiredEnvironmentVariable('STORAGE_PUBLIC_BASE_URL'),
	'STORAGE_PUBLIC_BASE_URL'
);
const targetRegion = requiredEnvironmentVariable('STORAGE_REGION');
const targetAccessKeyId = requiredEnvironmentVariable('STORAGE_ACCESS_KEY_ID');
const targetSecretAccessKey = requiredEnvironmentVariable('STORAGE_SECRET_ACCESS_KEY');
const targetSessionToken = process.env.STORAGE_SESSION_TOKEN?.trim() || undefined;

if (!endpointTargetsBucket(sourceEndpoint, sourceBucket)) {
	throw new Error('STORAGE_SOURCE_ENDPOINT must be the exact endpoint for STORAGE_SOURCE_BUCKET.');
}

if (!endpointTargetsBucket(targetEndpoint, targetBucket)) {
	throw new Error('STORAGE_ENDPOINT must be the exact endpoint for STORAGE_BUCKET.');
}

const targetRef = targetReference(databaseUrl);
if (execute && confirmedTarget !== targetRef) {
	throw new Error(
		`Target confirmation mismatch. Re-run with --confirm-target=${targetRef} after verifying the target.`
	);
}

const postgres = new Client({ connectionString: databaseUrl });
const source = new S3Client({
	region: sourceRegion,
	bucketEndpoint: true,
	credentials: {
		accessKeyId: sourceAccessKeyId,
		secretAccessKey: sourceSecretAccessKey,
		sessionToken: sourceSessionToken
	}
});
const destination = new S3Client({
	region: targetRegion,
	bucketEndpoint: true,
	credentials: {
		accessKeyId: targetAccessKeyId,
		secretAccessKey: targetSecretAccessKey,
		sessionToken: targetSessionToken
	}
});

try {
	await postgres.connect();
	const manifestResult = await postgres.query<{
		id: string;
		key: string;
		name: string;
		size: string;
		mime: string;
	}>('select id, key, name, size::text, mime from app.file_metas order by key');
	const manifest: FileManifestEntry[] = manifestResult.rows.map((row) => ({
		...row,
		size: Number(row.size)
	}));
	const fileByKey = new Map(manifest.map((entry) => [entry.key, entry]));

	console.log(`Target PostgreSQL project reference: ${targetRef}`);
	console.log(`Mode: ${execute ? 'EXECUTE' : 'DRY RUN (read-only)'}`);
	console.log(`File manifest entries: ${manifest.length}`);
	console.log(`Source bucket: ${sourceBucket}`);
	console.log(`Target bucket: ${targetBucket}`);

	let destinationObjects = 0;
	for (const entry of manifest) {
		const sourceExists = await objectExists(source, sourceEndpoint, entry);
		if (!sourceExists) throw new Error(`${entry.key}: source object does not exist.`);
		if (await objectExists(destination, targetEndpoint, entry)) destinationObjects += 1;
	}
	console.log(`Target objects already present with matching sizes: ${destinationObjects}`);

	const contentTables = ['posts', 'petitions'] as const;
	const rewrites: Array<{ table: (typeof contentTables)[number]; id: string; content: string }> =
		[];
	let embeddedImages = 0;
	for (const table of contentTables) {
		const result = await postgres.query<ArticleContent>(
			`select id, content from app.${table} where content ilike '%<img%'`
		);
		for (const article of result.rows) {
			const rewritten = rewriteEmbeddedImages(article.content, fileByKey, targetPublicBaseUrl);
			embeddedImages += rewritten.imageCount;
			if (rewritten.content !== article.content) {
				rewrites.push({ table, id: article.id, content: rewritten.content });
			}
		}
	}
	console.log(`Embedded images to normalize: ${embeddedImages}`);
	console.log(`Article rows to update: ${rewrites.length}`);

	if (!execute) {
		console.log('Validation passed. No storage objects or PostgreSQL rows were changed.');
		console.log(`Execute with: npm run storage:migrate -- --execute --confirm-target=${targetRef}`);
	} else {
		for (const entry of manifest) {
			const sourceBody = await getObject(source, sourceEndpoint, entry.key);
			if (sourceBody.byteLength !== entry.size) {
				throw new Error(`${entry.key}: downloaded source object size does not match file_metas.`);
			}
			const sourceDigest = sha256(sourceBody);

			let destinationMatches = false;
			if (await objectExists(destination, targetEndpoint, entry)) {
				const existingBody = await getObject(destination, targetEndpoint, entry.key);
				destinationMatches = sha256(existingBody) === sourceDigest;
			}

			if (!destinationMatches) {
				await destination.send(
					new PutObjectCommand({
						Bucket: targetEndpoint,
						Key: entry.key,
						Body: sourceBody,
						ContentLength: sourceBody.byteLength,
						ContentType: entry.mime
					})
				);
			}

			const verifiedBody = await getObject(destination, targetEndpoint, entry.key);
			if (sha256(verifiedBody) !== sourceDigest) {
				throw new Error(`${entry.key}: target SHA-256 verification failed.`);
			}

			const publicResponse = await fetch(publicObjectUrl(targetPublicBaseUrl, entry.key));
			if (!publicResponse.ok) {
				throw new Error(`${entry.key}: public target URL returned HTTP ${publicResponse.status}.`);
			}
			const publicBody = new Uint8Array(await publicResponse.arrayBuffer());
			if (sha256(publicBody) !== sourceDigest) {
				throw new Error(`${entry.key}: public target URL SHA-256 verification failed.`);
			}
		}

		await postgres.query('begin');
		try {
			for (const rewrite of rewrites) {
				await postgres.query(`update app.${rewrite.table} set content = $1 where id = $2`, [
					rewrite.content,
					rewrite.id
				]);
			}
			await postgres.query('commit');
		} catch (error) {
			await postgres.query('rollback');
			throw error;
		}

		console.log(
			`Migration completed: ${manifest.length} object(s) verified and ${rewrites.length} article row(s) updated.`
		);
		console.log('Source objects were not deleted.');
	}
} finally {
	source.destroy();
	destination.destroy();
	await postgres.end();
}
