import type { ActivityLogCreate } from '$lib/types/activity-log.type.js';
import type { BoardId } from '$lib/types/board.type.js';
import type {
	Comment,
	CommentCreate,
	CommentId,
	CommentPermissionMap
} from '$lib/types/comment.type.js';
import type { FileId, FileMeta } from '$lib/types/file-meta.type.js';
import type { FilePresence, Page } from '$lib/types/general.type.js';
import type {
	Post,
	PostCreate,
	PostEntity,
	PostId,
	PostPermissions
} from '$lib/types/post.type.js';
import type { DisplayType, User } from '$lib/types/user.type.js';

import { transaction } from '$lib/server/db.js';
import * as ActivityLogService from '$lib/services/activity-log.service.js';
import * as CommentService from '$lib/services/comment.service.js';
import * as FileMetaService from '$lib/services/file-meta.service.js';
import * as PointService from '$lib/services/point.service.js';
import * as PostService from '$lib/services/post.service.js';
import * as ThrottleService from '$lib/services/throttle.service.js';
import * as UserService from '$lib/services/user.service.js';
import { hasCapability } from '$lib/shared/permission.js';

async function getPostLogSnapshot(post: PostEntity) {
	const files = await FileMetaService.getFileMetasByArticleId(post.id);
	return {
		...post,
		fileIds: files.map((file) => file.id)
	};
}

export async function getBoardPage(boardId: BoardId, page: number, user: User) {
	const limit = 10;
	const skip = (page - 1) * limit;

	const postResult = await PostService.getPostPageByBoardId(boardId, limit, skip);
	const [userIdToUser, filePresence] = await Promise.all([
		UserService.findUserMapByIds(postResult.items.map((post) => post.userId)),
		FileMetaService.getFilePresenceByArticleIds(postResult.items.map((post) => post.id))
	]);
	const posts = UserService.attachDisplayNames(postResult.items, userIdToUser, {
		noIdxForAnon: true
	});

	const canCreatePost =
		(boardId === 'free' && hasCapability(user, 'board.free.write')) ||
		(boardId === 'notice' && hasCapability(user, 'board.notice.write')) ||
		(boardId === 'bylaw' && hasCapability(user, 'board.bylaw.write'));

	return {
		postPage: { ...postResult, items: posts } as Page<Post>,
		filePresence: filePresence as FilePresence,
		canCreatePost
	};
}

export async function getPostDetailByPostId(
	postId: PostId,
	user: User,
	options?: { incrementView?: boolean }
): Promise<{
	post: Post;
	comments: Comment[];
	files: FileMeta[];
	postPermissions: PostPermissions;
	commentPermissions: CommentPermissionMap;
	canCreateComment: boolean;
}> {
	const postRaw =
		options?.incrementView === true
			? await PostService.viewPostById(postId)
			: await PostService.getPostById(postId);
	const [commentsAsc, files] = await Promise.all([
		CommentService.getCommentsByPostId(postId),
		FileMetaService.getFileMetasByArticleId(postId)
	]);
	const commentsRaw = commentsAsc.toReversed();

	const filled = await UserService.fillDisplayNames([postRaw, ...commentsRaw]);

	const post = filled[0] as Post;
	const comments = filled.slice(1) as Comment[];

	return {
		post,
		comments,
		files,
		postPermissions: PostService.getPostPermissions(post, user),
		commentPermissions: Object.fromEntries(
			comments.map((comment) => [comment.id, CommentService.getCommentPermissions(comment, user)])
		),
		canCreateComment: hasCapability(user, 'comment.write')
	};
}

export async function createPost(
	boardId: BoardId,
	title: string,
	content: string,
	user: User,
	displayType: DisplayType,
	fileIds: FileId[]
): Promise<PostEntity> {
	return await transaction(async () => {
		await ThrottleService.reserve(user.id, 'article');

		const postCreate: PostCreate = {
			boardId,
			title,
			content,
			userId: user.id,
			displayType
		};

		const post = await PostService.createPostByBoardId(postCreate, user);
		await FileMetaService.linkArticleToFiles(fileIds, post.id);

		const postSnapshot = await getPostLogSnapshot(post);
		await ActivityLogService.create({
			actorId: user.id,
			action: 'create',
			targetType: 'post',
			targetId: post.id,
			cause: 'direct',
			beforeSnapshot: null,
			afterSnapshot: postSnapshot
		});
		await PointService.awardPostCreate(user.id, post.id);
		return post;
	});
}

export async function editPost(
	postId: PostId,
	title: string,
	content: string,
	user: User,
	displayType: DisplayType,
	fileIds: FileId[]
): Promise<PostEntity> {
	return await transaction(async () => {
		const beforePost = await PostService.getPostById(postId);
		const beforeSnapshot = await getPostLogSnapshot(beforePost);

		const post = await PostService.editPostById(
			postId,
			{
				title,
				content,
				displayType
			},
			user
		);
		await FileMetaService.linkArticleToFiles(fileIds, postId);
		const afterSnapshot = await getPostLogSnapshot(post);
		await ActivityLogService.create({
			actorId: user.id,
			action: 'edit',
			targetType: 'post',
			targetId: post.id,
			cause: 'direct',
			beforeSnapshot,
			afterSnapshot
		});
		return post;
	});
}

export async function deletePostById(postId: PostId, user: User) {
	return await transaction(async () => {
		const comments = await CommentService.getCommentsByPostId(postId);
		const beforePost = await PostService.getPostById(postId);
		const postSnapshot = await getPostLogSnapshot(beforePost);
		const deletedPost = await PostService.deletePostById(postId, user);
		await FileMetaService.unlinkArticleFromAllFiles(postId);
		await CommentService.deleteCommentsByPostId(postId);

		const activityLogs: ActivityLogCreate[] = [
			{
				actorId: user.id,
				action: 'delete',
				targetType: 'post',
				targetId: deletedPost.id,
				cause: 'direct',
				beforeSnapshot: postSnapshot,
				afterSnapshot: null
			},
			...comments.map((comment) => ({
				actorId: user.id,
				action: 'delete' as const,
				targetType: 'comment' as const,
				targetId: comment.id,
				cause: 'post-delete-cascade' as const,
				beforeSnapshot: comment,
				afterSnapshot: null
			}))
		];
		await ActivityLogService.createMany(activityLogs);
	});
}

export async function likePost(postId: PostId, user: User) {
	return await transaction(async () => {
		const post = await PostService.likePostById(postId, user);
		await PointService.applyPostLikeDelta(post.userId, postId, user.id, 1);
		return post;
	});
}

export async function unlikePost(postId: PostId, user: User) {
	return await transaction(async () => {
		const post = await PostService.unlikePostById(postId, user);
		await PointService.applyPostLikeDelta(post.userId, postId, user.id, -1);
		return post;
	});
}

export async function createCommentAndUpdatePost(
	postId: PostId,
	content: string,
	user: User,
	displayType: DisplayType
) {
	return await transaction(async () => {
		await ThrottleService.reserve(user.id, 'comment');
		await PostService.incrementCommentCountByPostId(postId, 1);
		const commentCreate: CommentCreate = {
			postId,
			content,
			userId: user.id,
			displayType
		};
		const comment = await CommentService.createCommentByPostId(commentCreate, user);
		await ActivityLogService.create({
			actorId: user.id,
			action: 'create',
			targetType: 'comment',
			targetId: comment.id,
			cause: 'direct',
			beforeSnapshot: null,
			afterSnapshot: comment
		});
		await PointService.awardCommentCreate(user.id, comment.id);
		return comment;
	});
}

export async function deleteCommentAndUpdatePost(commentId: CommentId, user: User) {
	return await transaction(async () => {
		const deletedComment = await CommentService.deleteCommentById(commentId, user);
		await PostService.incrementCommentCountByPostId(deletedComment.postId, -1);
		await ActivityLogService.create({
			actorId: user.id,
			action: 'delete',
			targetType: 'comment',
			targetId: deletedComment.id,
			cause: 'direct',
			beforeSnapshot: deletedComment,
			afterSnapshot: null
		});
	});
}
