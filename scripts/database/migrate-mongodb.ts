import { randomUUID } from 'node:crypto';

import { MongoClient, type Document } from 'mongodb';
import { Client, type PoolClient } from 'pg';

const GOOGLE_ISSUER = 'https://accounts.google.com';
const BATCH_SIZE = 500;
const USER_ID_ALIASES = new Map([
	['42097a24-6310-4252-b18c-f155091b921a', '110607964707037878244']
]);

const targetTables = [
	'app.activity_logs',
	'app.push_subscriptions',
	'app.throttles',
	'app.point_states',
	'app.petition_files',
	'app.post_files',
	'app.file_metas',
	'app.reviews',
	'app.petition_signatures',
	'app.petitions',
	'app.comments',
	'app.post_likes',
	'app.posts',
	'app.professors',
	'app.courses',
	'private.user_identities',
	'app.users'
] as const;

const args = new Set(process.argv.slice(2));
const execute = args.has('--execute');
const resetTarget = args.has('--reset-target');
const confirmTargetArgument = process.argv
	.slice(2)
	.find((argument) => argument.startsWith('--confirm-target='));
const confirmedTarget = confirmTargetArgument?.slice('--confirm-target='.length);

if (args.has('--help')) {
	const help = `
MongoDB -> PostgreSQL data migration

Dry-run (read-only):
  npm run db:migrate:data

Execute against an empty target:
  npm run db:migrate:data -- --execute --confirm-target=<project-ref>

Delete target data first, then execute:
  npm run db:migrate:data -- --execute --reset-target --confirm-target=<project-ref>

Environment:
  MONGO_URI           MongoDB source
  DIRECT_DATABASE_URL PostgreSQL target (direct or session pooler on port 5432)
`;
	await new Promise<void>((resolve) => process.stdout.write(help, () => resolve()));
	process.exit(0);
}

const mongoUrl = process.env.MONGO_URI;
const postgresUrl = process.env.DIRECT_DATABASE_URL;

if (!mongoUrl) throw new Error('MONGO_URI is required.');
if (!postgresUrl) throw new Error('DIRECT_DATABASE_URL is required.');
if (resetTarget && !execute) {
	throw new Error('--reset-target may only be used together with --execute.');
}

function idOf(value: unknown, context: string): string {
	if (typeof value === 'string' && value.length > 0) return value;
	if (
		typeof value === 'object' &&
		value !== null &&
		'toHexString' in value &&
		typeof value.toHexString === 'function'
	) {
		return value.toHexString();
	}
	throw new Error(`${context}: invalid or missing identifier.`);
}

function requiredString(value: unknown, context: string): string {
	if (typeof value !== 'string' || value.length === 0) {
		throw new Error(`${context}: expected a non-empty string.`);
	}
	return value;
}

function numberOr(value: unknown, fallback: number, context: string): number {
	if (value === undefined || value === null) return fallback;
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new Error(`${context}: expected a finite number.`);
	}
	return value;
}

function timestamp(value: unknown, context: string): Date {
	const result = value instanceof Date ? value : new Date(requiredString(value, context));
	if (Number.isNaN(result.getTime())) throw new Error(`${context}: invalid timestamp.`);
	return result;
}

function optionalTimestamp(value: unknown, context: string): Date | null {
	return value === undefined || value === null ? null : timestamp(value, context);
}

function stringArray(value: unknown, context: string): string[] {
	if (value === undefined || value === null) return [];
	if (!Array.isArray(value)) throw new Error(`${context}: expected an array.`);
	return value.map((item, index) => idOf(item, `${context}[${index}]`));
}

function mappedId(map: Map<string, string>, sourceId: unknown, context: string): string {
	const key = idOf(sourceId, context);
	const mapped = map.get(key);
	if (!mapped) throw new Error(`${context}: referenced source id "${key}" does not exist.`);
	return mapped;
}

function optionalMappedId(
	map: Map<string, string>,
	sourceId: unknown,
	context: string
): string | undefined {
	return map.get(idOf(sourceId, context));
}

function createIdMap(documents: Document[], collection: string): Map<string, string> {
	const result = new Map<string, string>();
	for (const document of documents) {
		const sourceId = idOf(document._id, `${collection}._id`);
		if (result.has(sourceId)) throw new Error(`${collection}: duplicate _id "${sourceId}".`);
		result.set(sourceId, randomUUID());
	}
	return result;
}

function targetReference(connectionString: string): string {
	const url = new URL(connectionString);
	const username = decodeURIComponent(url.username);
	const poolerMatch = /^postgres\.([a-z0-9]+)$/i.exec(username);
	const directMatch = /^db\.([a-z0-9]+)\.supabase\.co$/i.exec(url.hostname);
	return poolerMatch?.[1] ?? directMatch?.[1] ?? `${url.hostname}-${url.pathname.slice(1)}`;
}

function quoteIdentifier(identifier: string): string {
	if (!/^[a-z_][a-z0-9_]*$/i.test(identifier)) {
		throw new Error(`Unsafe SQL identifier: ${identifier}`);
	}
	return `"${identifier}"`;
}

function quoteTable(table: string): string {
	return table.split('.').map(quoteIdentifier).join('.');
}

async function insertRows(
	client: PoolClient | Client,
	table: string,
	columns: string[],
	rows: unknown[][]
): Promise<void> {
	if (rows.length === 0) return;

	for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
		const batch = rows.slice(offset, offset + BATCH_SIZE);
		const values = batch.flat();
		const placeholders = batch
			.map(
				(_, rowIndex) =>
					`(${columns.map((__, columnIndex) => `$${rowIndex * columns.length + columnIndex + 1}`).join(', ')})`
			)
			.join(', ');

		await client.query(
			`insert into ${quoteTable(table)} (${columns.map(quoteIdentifier).join(', ')}) values ${placeholders}`,
			values
		);
	}
}

async function targetCounts(client: Client): Promise<Map<string, number>> {
	const counts = new Map<string, number>();
	for (const table of targetTables) {
		const result = await client.query<{ count: string }>(
			`select count(*)::text as count from ${quoteTable(table)}`
		);
		counts.set(table, Number(result.rows[0]?.count ?? 0));
	}
	return counts;
}

function assertUnique(values: string[], context: string): void {
	const seen = new Set<string>();
	for (const value of values) {
		if (seen.has(value)) throw new Error(`${context}: duplicate value "${value}".`);
		seen.add(value);
	}
}

const mongo = new MongoClient(mongoUrl);
const postgres = new Client({ connectionString: postgresUrl });

try {
	await mongo.connect();
	await postgres.connect();

	const source = mongo.db();
	const targetRef = targetReference(postgresUrl);
	console.log(`Source MongoDB database: ${source.databaseName}`);
	console.log(`Target PostgreSQL project reference: ${targetRef}`);
	console.log(`Mode: ${execute ? 'EXECUTE' : 'DRY RUN (read-only)'}`);

	const collectionNames = [
		'users',
		'courses',
		'professors',
		'posts',
		'comments',
		'petitions',
		'reviews',
		'filemetas',
		'pointstates',
		'throttles',
		'pushsubscriptions'
	] as const;
	const collections = Object.fromEntries(
		await Promise.all(
			collectionNames.map(async (name) => [name, await source.collection(name).find({}).toArray()])
		)
	) as Record<(typeof collectionNames)[number], Document[]>;

	for (const name of collectionNames) {
		console.log(`  ${name}: ${collections[name].length}`);
	}
	console.log('  activitylogs: skipped intentionally');

	const userIds = createIdMap(collections.users, 'users');
	for (const [alias, canonicalSourceId] of USER_ID_ALIASES) {
		const canonicalUserId = userIds.get(canonicalSourceId);
		if (!canonicalUserId) {
			throw new Error(`User id alias "${alias}" points to missing user "${canonicalSourceId}".`);
		}
		if (userIds.has(alias)) {
			throw new Error(`User id alias "${alias}" conflicts with an existing user.`);
		}
		userIds.set(alias, canonicalUserId);
	}
	const professorIds = createIdMap(collections.professors, 'professors');
	const postIds = createIdMap(collections.posts, 'posts');
	const commentIds = createIdMap(collections.comments, 'comments');
	const petitionIds = createIdMap(collections.petitions, 'petitions');
	const reviewIds = createIdMap(collections.reviews, 'reviews');
	const fileIds = createIdMap(collections.filemetas, 'filemetas');
	const pointStateIds = createIdMap(collections.pointstates, 'pointstates');
	const throttleIds = createIdMap(collections.throttles, 'throttles');
	const pushSubscriptionIds = createIdMap(collections.pushsubscriptions, 'pushsubscriptions');
	const skippedReferences = new Map<string, number>();
	const markSkipped = (kind: string) =>
		skippedReferences.set(kind, (skippedReferences.get(kind) ?? 0) + 1);
	const deduplicateRows = (
		rows: unknown[][],
		keyOf: (row: unknown[]) => string,
		kind: string,
		preferIncoming: (existing: unknown[], incoming: unknown[]) => boolean = () => false
	) => {
		const uniqueRows = new Map<string, unknown[]>();
		for (const row of rows) {
			const key = keyOf(row);
			const existing = uniqueRows.get(key);
			if (!existing) uniqueRows.set(key, row);
			else {
				markSkipped(kind);
				if (preferIncoming(existing, row)) uniqueRows.set(key, row);
			}
		}
		rows.splice(0, rows.length, ...uniqueRows.values());
	};
	const tombstoneUserSourceIds = new Set<string>();
	const requireContentUser = (value: unknown, context: string) => {
		const sourceId = idOf(value, context);
		if (!userIds.has(sourceId)) {
			userIds.set(sourceId, randomUUID());
			tombstoneUserSourceIds.add(sourceId);
		}
	};

	for (const post of collections.posts) {
		requireContentUser(post.userId, `posts.${idOf(post._id, 'posts._id')}.userId`);
	}
	for (const comment of collections.comments) {
		requireContentUser(comment.userId, `comments.${idOf(comment._id, 'comments._id')}.userId`);
	}
	for (const petition of collections.petitions) {
		const sourceId = idOf(petition._id, 'petitions._id');
		requireContentUser(petition.petitionerId, `petitions.${sourceId}.petitionerId`);
		if (petition.responderId) {
			requireContentUser(petition.responderId, `petitions.${sourceId}.responderId`);
		}
	}
	for (const review of collections.reviews) {
		requireContentUser(review.userId, `reviews.${idOf(review._id, 'reviews._id')}.userId`);
	}

	assertUnique(
		collections.users.map((user) => requiredString(user.nickname, 'users.nickname')),
		'users.nickname'
	);
	assertUnique(
		collections.professors.map((professor) => requiredString(professor.name, 'professors.name')),
		'professors.name'
	);
	assertUnique(
		collections.filemetas.map((file) => requiredString(file.key, 'filemetas.key')),
		'filemetas.key'
	);

	const now = new Date();
	const usersRows: unknown[][] = collections.users.map((user) => {
		const sourceId = idOf(user._id, 'users._id');
		return [
			userIds.get(sourceId),
			requiredString(user.email, `users.${sourceId}.email`),
			requiredString(user.realName, `users.${sourceId}.realName`),
			requiredString(user.nickname, `users.${sourceId}.nickname`),
			requiredString(user.group, `users.${sourceId}.group`),
			optionalTimestamp(user.blockedUntil, `users.${sourceId}.blockedUntil`),
			optionalTimestamp(user.deletedAt, `users.${sourceId}.deletedAt`),
			numberOr(user.points, 0, `users.${sourceId}.points`),
			user.createdAt ? timestamp(user.createdAt, `users.${sourceId}.createdAt`) : now,
			user.updatedAt ? timestamp(user.updatedAt, `users.${sourceId}.updatedAt`) : now
		];
	});
	for (const sourceId of tombstoneUserSourceIds) {
		const userId = userIds.get(sourceId);
		usersRows.push([
			userId,
			`deleted+${userId}@invalid.local`,
			'탈퇴한 사용자',
			`deleted-${userId?.slice(0, 8)}`,
			'guest',
			null,
			now,
			0,
			now,
			now
		]);
	}
	const identityRows = collections.users.map((user) => {
		const sourceId = idOf(user._id, 'users._id');
		const email = requiredString(user.email, `users.${sourceId}.email`);
		return [
			randomUUID(),
			userIds.get(sourceId),
			GOOGLE_ISSUER,
			sourceId,
			email,
			user.createdAt ? timestamp(user.createdAt, `users.${sourceId}.createdAt`) : now,
			user.updatedAt ? timestamp(user.updatedAt, `users.${sourceId}.updatedAt`) : now
		];
	});

	const coursesRows = collections.courses.map((course) => {
		const sourceId = idOf(course._id, 'courses._id');
		return [
			sourceId,
			requiredString(course.name, `courses.${sourceId}.name`),
			requiredString(course.content, `courses.${sourceId}.content`)
		];
	});
	const courseIds = new Set(coursesRows.map(([id]) => String(id)));

	const professorsRows = collections.professors.map((professor) => {
		const sourceId = idOf(professor._id, 'professors._id');
		return [
			professorIds.get(sourceId),
			requiredString(professor.name, `professors.${sourceId}.name`)
		];
	});

	const actualCommentCounts = new Map<string, number>();
	for (const comment of collections.comments) {
		const sourcePostId = idOf(comment.postId, 'comments.postId');
		actualCommentCounts.set(sourcePostId, (actualCommentCounts.get(sourcePostId) ?? 0) + 1);
	}
	let normalizedCommentCount = 0;
	const postsRows = collections.posts.map((post) => {
		const sourceId = idOf(post._id, 'posts._id');
		const commentCount = actualCommentCounts.get(sourceId) ?? 0;
		if (numberOr(post.commentCnt, 0, `posts.${sourceId}.commentCnt`) !== commentCount) {
			normalizedCommentCount += 1;
		}
		return [
			postIds.get(sourceId),
			requiredString(post.boardId, `posts.${sourceId}.boardId`),
			mappedId(userIds, post.userId, `posts.${sourceId}.userId`),
			requiredString(post.displayType, `posts.${sourceId}.displayType`),
			requiredString(post.title, `posts.${sourceId}.title`),
			requiredString(post.content, `posts.${sourceId}.content`),
			numberOr(post.viewCnt, 0, `posts.${sourceId}.viewCnt`),
			commentCount,
			timestamp(post.createdAt, `posts.${sourceId}.createdAt`),
			post.updatedAt
				? timestamp(post.updatedAt, `posts.${sourceId}.updatedAt`)
				: timestamp(post.createdAt, `posts.${sourceId}.createdAt`)
		];
	});

	const postLikeRows: unknown[][] = [];
	for (const post of collections.posts) {
		const sourceId = idOf(post._id, 'posts._id');
		const uniqueUserIds = new Set(stringArray(post.likedBy, `posts.${sourceId}.likedBy`));
		for (const userId of uniqueUserIds) {
			const mappedUserId = optionalMappedId(userIds, userId, `posts.${sourceId}.likedBy`);
			if (!mappedUserId) {
				markSkipped('post likes whose user no longer exists');
				continue;
			}
			postLikeRows.push([
				postIds.get(sourceId),
				mappedUserId,
				timestamp(post.createdAt, `posts.${sourceId}.createdAt`)
			]);
		}
	}
	deduplicateRows(
		postLikeRows,
		(row) => `${row[0]}:${row[1]}`,
		'duplicate post likes merged by user alias'
	);

	const commentsRows = collections.comments.map((comment) => {
		const sourceId = idOf(comment._id, 'comments._id');
		return [
			commentIds.get(sourceId),
			mappedId(postIds, comment.postId, `comments.${sourceId}.postId`),
			mappedId(userIds, comment.userId, `comments.${sourceId}.userId`),
			requiredString(comment.displayType, `comments.${sourceId}.displayType`),
			requiredString(comment.content, `comments.${sourceId}.content`),
			timestamp(comment.createdAt, `comments.${sourceId}.createdAt`),
			comment.updatedAt
				? timestamp(comment.updatedAt, `comments.${sourceId}.updatedAt`)
				: timestamp(comment.createdAt, `comments.${sourceId}.createdAt`)
		];
	});

	const petitionsRows = collections.petitions.map((petition) => {
		const sourceId = idOf(petition._id, 'petitions._id');
		return [
			petitionIds.get(sourceId),
			requiredString(petition.title, `petitions.${sourceId}.title`),
			requiredString(petition.content, `petitions.${sourceId}.content`),
			requiredString(petition.status ?? 'ongoing', `petitions.${sourceId}.status`),
			numberOr(petition.viewCnt, 0, `petitions.${sourceId}.viewCnt`),
			mappedId(userIds, petition.petitionerId, `petitions.${sourceId}.petitionerId`),
			petition.responderId
				? mappedId(userIds, petition.responderId, `petitions.${sourceId}.responderId`)
				: null,
			typeof petition.response === 'string' ? petition.response : null,
			optionalTimestamp(petition.answeredAt, `petitions.${sourceId}.answeredAt`),
			timestamp(petition.createdAt, `petitions.${sourceId}.createdAt`),
			timestamp(petition.updatedAt, `petitions.${sourceId}.updatedAt`)
		];
	});

	const petitionSignatureRows: unknown[][] = [];
	for (const petition of collections.petitions) {
		const sourceId = idOf(petition._id, 'petitions._id');
		const uniqueUserIds = new Set(stringArray(petition.signedBy, `petitions.${sourceId}.signedBy`));
		for (const userId of uniqueUserIds) {
			const mappedUserId = optionalMappedId(userIds, userId, `petitions.${sourceId}.signedBy`);
			if (!mappedUserId) {
				markSkipped('petition signatures whose user no longer exists');
				continue;
			}
			petitionSignatureRows.push([
				petitionIds.get(sourceId),
				mappedUserId,
				timestamp(petition.createdAt, `petitions.${sourceId}.createdAt`)
			]);
		}
	}
	deduplicateRows(
		petitionSignatureRows,
		(row) => `${row[0]}:${row[1]}`,
		'duplicate petition signatures merged by user alias'
	);

	const reviewsRows = collections.reviews.map((review) => {
		const sourceId = idOf(review._id, 'reviews._id');
		const courseId = idOf(review.courseId, `reviews.${sourceId}.courseId`);
		if (!courseIds.has(courseId)) {
			throw new Error(
				`reviews.${sourceId}.courseId: referenced course "${courseId}" does not exist.`
			);
		}
		const score = review.score;
		if (typeof score !== 'object' || score === null) {
			throw new Error(`reviews.${sourceId}.score: expected an object.`);
		}
		return [
			reviewIds.get(sourceId),
			courseId,
			mappedId(professorIds, review.professorId, `reviews.${sourceId}.professorId`),
			mappedId(userIds, review.userId, `reviews.${sourceId}.userId`),
			numberOr(review.year, 0, `reviews.${sourceId}.year`),
			numberOr(review.term, 0, `reviews.${sourceId}.term`),
			requiredString(review.title, `reviews.${sourceId}.title`),
			numberOr(score.assignment, 0, `reviews.${sourceId}.score.assignment`),
			numberOr(score.lecture, 0, `reviews.${sourceId}.score.lecture`),
			numberOr(score.exam, 0, `reviews.${sourceId}.score.exam`),
			numberOr(score.satisfaction, 0, `reviews.${sourceId}.score.satisfaction`),
			typeof review.comment === 'string' ? review.comment : '',
			timestamp(review.createdAt, `reviews.${sourceId}.createdAt`),
			timestamp(review.updatedAt, `reviews.${sourceId}.updatedAt`)
		];
	});

	const fileRows = collections.filemetas.map((file) => {
		const sourceId = idOf(file._id, 'filemetas._id');
		return [
			fileIds.get(sourceId),
			requiredString(file.key, `filemetas.${sourceId}.key`),
			requiredString(file.name, `filemetas.${sourceId}.name`),
			numberOr(file.size, 0, `filemetas.${sourceId}.size`),
			requiredString(file.mime, `filemetas.${sourceId}.mime`),
			requiredString(file.ext, `filemetas.${sourceId}.ext`),
			timestamp(file.createdAt, `filemetas.${sourceId}.createdAt`),
			timestamp(file.updatedAt, `filemetas.${sourceId}.updatedAt`)
		];
	});

	const postFileRows: unknown[][] = [];
	const petitionFileRows: unknown[][] = [];
	for (const file of collections.filemetas) {
		const sourceId = idOf(file._id, 'filemetas._id');
		const fileId = fileIds.get(sourceId);
		for (const articleId of new Set(
			stringArray(file.articleIds, `filemetas.${sourceId}.articleIds`)
		)) {
			const postId = postIds.get(articleId);
			const petitionId = petitionIds.get(articleId);
			if (postId && petitionId) {
				throw new Error(
					`filemetas.${sourceId}.articleIds: "${articleId}" matches both a post and petition.`
				);
			}
			if (postId) postFileRows.push([postId, fileId]);
			else if (petitionId) petitionFileRows.push([petitionId, fileId]);
			else {
				markSkipped('file links whose article no longer exists');
			}
		}
	}

	const pointStateRows: unknown[][] = [];
	for (const state of collections.pointstates) {
		const sourceId = idOf(state._id, 'pointstates._id');
		const userId = optionalMappedId(userIds, state.userId, `pointstates.${sourceId}.userId`);
		if (!userId) {
			markSkipped('point states whose user no longer exists');
			continue;
		}
		const counts = state.counts;
		if (typeof counts !== 'object' || counts === null) {
			throw new Error(`pointstates.${sourceId}.counts: expected an object.`);
		}
		pointStateRows.push([
			pointStateIds.get(sourceId),
			userId,
			requiredString(state.dateKey, `pointstates.${sourceId}.dateKey`),
			numberOr(counts.post, 0, `pointstates.${sourceId}.counts.post`),
			numberOr(counts.comment, 0, `pointstates.${sourceId}.counts.comment`),
			numberOr(counts.review, 0, `pointstates.${sourceId}.counts.review`),
			numberOr(counts.petition, 0, `pointstates.${sourceId}.counts.petition`),
			timestamp(state.createdAt, `pointstates.${sourceId}.createdAt`),
			timestamp(state.updatedAt, `pointstates.${sourceId}.updatedAt`)
		]);
	}
	deduplicateRows(
		pointStateRows,
		(row) => String(row[1]),
		'duplicate point states merged by user alias',
		(existing, incoming) =>
			Number(new Date(String(incoming[8]))) > Number(new Date(String(existing[8])))
	);
	assertUnique(
		pointStateRows.map((row) => String(row[1])),
		'pointstates.userId'
	);

	const throttleRows: unknown[][] = [];
	for (const throttle of collections.throttles) {
		const sourceId = idOf(throttle._id, 'throttles._id');
		const userId = optionalMappedId(userIds, throttle.userId, `throttles.${sourceId}.userId`);
		if (!userId) {
			markSkipped('throttles whose user no longer exists');
			continue;
		}
		throttleRows.push([
			throttleIds.get(sourceId),
			userId,
			requiredString(throttle.bucket, `throttles.${sourceId}.bucket`),
			timestamp(throttle.availableAt, `throttles.${sourceId}.availableAt`),
			timestamp(throttle.createdAt, `throttles.${sourceId}.createdAt`),
			timestamp(throttle.updatedAt, `throttles.${sourceId}.updatedAt`)
		]);
	}
	deduplicateRows(
		throttleRows,
		(row) => `${row[1]}:${row[2]}`,
		'duplicate throttles merged by user alias',
		(existing, incoming) => Number(incoming[3]) > Number(existing[3])
	);
	assertUnique(
		throttleRows.map((row) => `${row[1]}:${row[2]}`),
		'throttles.userId+bucket'
	);

	const pushSubscriptionRows: unknown[][] = [];
	for (const subscription of collections.pushsubscriptions) {
		const sourceId = idOf(subscription._id, 'pushsubscriptions._id');
		const userId = optionalMappedId(
			userIds,
			subscription.userId,
			`pushsubscriptions.${sourceId}.userId`
		);
		if (!userId) {
			markSkipped('push subscriptions whose user no longer exists');
			continue;
		}
		const keys = subscription.keys;
		if (typeof keys !== 'object' || keys === null) {
			throw new Error(`pushsubscriptions.${sourceId}.keys: expected an object.`);
		}
		pushSubscriptionRows.push([
			pushSubscriptionIds.get(sourceId),
			userId,
			requiredString(subscription.endpoint, `pushsubscriptions.${sourceId}.endpoint`),
			subscription.expirationTime === null || subscription.expirationTime === undefined
				? null
				: numberOr(subscription.expirationTime, 0, `pushsubscriptions.${sourceId}.expirationTime`),
			requiredString(keys.p256dh, `pushsubscriptions.${sourceId}.keys.p256dh`),
			requiredString(keys.auth, `pushsubscriptions.${sourceId}.keys.auth`),
			typeof subscription.userAgent === 'string' ? subscription.userAgent : '',
			timestamp(subscription.createdAt, `pushsubscriptions.${sourceId}.createdAt`),
			timestamp(subscription.updatedAt, `pushsubscriptions.${sourceId}.updatedAt`)
		]);
	}
	deduplicateRows(
		pushSubscriptionRows,
		(row) => `${row[1]}:${row[2]}`,
		'duplicate push subscriptions merged by user alias',
		(existing, incoming) =>
			Number(new Date(String(incoming[8]))) > Number(new Date(String(existing[8])))
	);
	assertUnique(
		pushSubscriptionRows.map((row) => `${row[1]}:${row[2]}`),
		'pushsubscriptions.userId+endpoint'
	);

	if (normalizedCommentCount > 0) {
		console.log(
			`Normalized comment_count from actual comments for ${normalizedCommentCount} post(s).`
		);
	}
	if (tombstoneUserSourceIds.size > 0) {
		console.warn(
			`Created ${tombstoneUserSourceIds.size} non-login tombstone user(s) for retained content.`
		);
	}
	for (const [kind, count] of skippedReferences) {
		console.warn(`Skipped ${count} ${kind}.`);
	}

	const expectedCounts = new Map<string, number>([
		['app.users', usersRows.length],
		['private.user_identities', identityRows.length],
		['app.courses', coursesRows.length],
		['app.professors', professorsRows.length],
		['app.posts', postsRows.length],
		['app.post_likes', postLikeRows.length],
		['app.comments', commentsRows.length],
		['app.petitions', petitionsRows.length],
		['app.petition_signatures', petitionSignatureRows.length],
		['app.reviews', reviewsRows.length],
		['app.file_metas', fileRows.length],
		['app.post_files', postFileRows.length],
		['app.petition_files', petitionFileRows.length],
		['app.point_states', pointStateRows.length],
		['app.throttles', throttleRows.length],
		['app.push_subscriptions', pushSubscriptionRows.length],
		['app.activity_logs', 0]
	]);

	const existingCounts = await targetCounts(postgres);
	const existingTotal = Array.from(existingCounts.values()).reduce((sum, count) => sum + count, 0);
	console.log(`Target currently contains ${existingTotal} row(s) in managed tables.`);

	if (!execute) {
		console.log('Validation passed. No PostgreSQL data was changed.');
		console.log(
			`Execute with: npm run db:migrate:data -- --execute${existingTotal > 0 ? ' --reset-target' : ''} --confirm-target=${targetRef}`
		);
		process.exitCode = 0;
	} else {
		if (confirmedTarget !== targetRef) {
			throw new Error(
				`Target confirmation mismatch. Re-run with --confirm-target=${targetRef} after verifying the target.`
			);
		}
		if (existingTotal > 0 && !resetTarget) {
			throw new Error(
				`Target contains ${existingTotal} row(s). Re-run with --reset-target only if all target data may be deleted.`
			);
		}

		await postgres.query('begin');
		try {
			if (resetTarget) {
				await postgres.query(
					`truncate table ${targetTables.map(quoteTable).join(', ')} restart identity cascade`
				);
			}

			await insertRows(
				postgres,
				'app.users',
				[
					'id',
					'email',
					'real_name',
					'nickname',
					'group',
					'blocked_until',
					'deleted_at',
					'points',
					'created_at',
					'updated_at'
				],
				usersRows
			);
			await insertRows(
				postgres,
				'private.user_identities',
				['id', 'user_id', 'issuer', 'subject', 'email_at_login', 'created_at', 'updated_at'],
				identityRows
			);
			await insertRows(postgres, 'app.courses', ['id', 'name', 'content'], coursesRows);
			await insertRows(postgres, 'app.professors', ['id', 'name'], professorsRows);
			await insertRows(
				postgres,
				'app.posts',
				[
					'id',
					'board_id',
					'user_id',
					'display_type',
					'title',
					'content',
					'view_count',
					'comment_count',
					'created_at',
					'updated_at'
				],
				postsRows
			);
			await insertRows(
				postgres,
				'app.post_likes',
				['post_id', 'user_id', 'created_at'],
				postLikeRows
			);
			await insertRows(
				postgres,
				'app.comments',
				['id', 'post_id', 'user_id', 'display_type', 'content', 'created_at', 'updated_at'],
				commentsRows
			);
			await insertRows(
				postgres,
				'app.petitions',
				[
					'id',
					'title',
					'content',
					'status',
					'view_count',
					'petitioner_id',
					'responder_id',
					'response',
					'answered_at',
					'created_at',
					'updated_at'
				],
				petitionsRows
			);
			await insertRows(
				postgres,
				'app.petition_signatures',
				['petition_id', 'user_id', 'created_at'],
				petitionSignatureRows
			);
			await insertRows(
				postgres,
				'app.reviews',
				[
					'id',
					'course_id',
					'professor_id',
					'user_id',
					'year',
					'term',
					'title',
					'assignment_score',
					'lecture_score',
					'exam_score',
					'satisfaction_score',
					'comment',
					'created_at',
					'updated_at'
				],
				reviewsRows
			);
			await insertRows(
				postgres,
				'app.file_metas',
				['id', 'key', 'name', 'size', 'mime', 'ext', 'created_at', 'updated_at'],
				fileRows
			);
			await insertRows(postgres, 'app.post_files', ['post_id', 'file_id'], postFileRows);
			await insertRows(
				postgres,
				'app.petition_files',
				['petition_id', 'file_id'],
				petitionFileRows
			);
			await insertRows(
				postgres,
				'app.point_states',
				[
					'id',
					'user_id',
					'date_key',
					'post_count',
					'comment_count',
					'review_count',
					'petition_count',
					'created_at',
					'updated_at'
				],
				pointStateRows
			);
			await insertRows(
				postgres,
				'app.throttles',
				['id', 'user_id', 'bucket', 'available_at', 'created_at', 'updated_at'],
				throttleRows
			);
			await insertRows(
				postgres,
				'app.push_subscriptions',
				[
					'id',
					'user_id',
					'endpoint',
					'expiration_time',
					'p256dh',
					'auth',
					'user_agent',
					'created_at',
					'updated_at'
				],
				pushSubscriptionRows
			);

			const migratedCounts = await targetCounts(postgres);
			for (const [table, expected] of expectedCounts) {
				const actual = migratedCounts.get(table);
				if (actual !== expected) {
					throw new Error(`${table}: expected ${expected} row(s), found ${actual}.`);
				}
			}

			await postgres.query('commit');
			console.log('Migration committed successfully. All row-count checks passed.');
		} catch (error) {
			await postgres.query('rollback');
			throw error;
		}
	}
} finally {
	await Promise.allSettled([mongo.close(), postgres.end()]);
}
