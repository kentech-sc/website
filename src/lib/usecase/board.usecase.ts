import mongoose from 'mongoose';

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

import * as CommentService from '$lib/services/comment.service.js';
import * as FileMetaService from '$lib/services/file-meta.service.js';
import * as PostService from '$lib/services/post.service.js';
import * as UserService from '$lib/services/user.service.js';
import { hasCapability } from '$lib/shared/permission.js';

export async function getBoardPage(boardId: BoardId, page: number, user: User) {
	const limit = 10;
	const skip = (page - 1) * limit;

	const postResult = await PostService.getPostPageByBoardId(boardId, limit, skip);
	const [userIdToUser, filePresence] = await Promise.all([
		UserService.findUserMapByIds(postResult.items.map((post) => post.userId)),
		FileMetaService.getFilePresenceByArticleIds(postResult.items.map((post) => post._id))
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
			comments.map((comment) => [comment._id, CommentService.getCommentPermissions(comment, user)])
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
	return await mongoose.connection.transaction(async () => {
		const postCreate: PostCreate = {
			boardId,
			title,
			content,
			userId: user._id,
			displayType
		};
		const post = await PostService.createPostByBoardId(postCreate, user);
		await FileMetaService.linkArticleToFiles(fileIds, post._id);
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
	return await mongoose.connection.transaction(async () => {
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
		return post;
	});
}

export async function deletePostById(postId: PostId, user: User) {
	return await mongoose.connection.transaction(async () => {
		await PostService.deletePostById(postId, user);
		await FileMetaService.unlinkArticleFromAllFiles(postId);
		await CommentService.deleteCommentsByPostId(postId);
	});
}

export async function likePost(postId: PostId, user: User) {
	return await PostService.likePostById(postId, user);
}

export async function unlikePost(postId: PostId, user: User) {
	return await PostService.unlikePostById(postId, user);
}

export async function createCommentAndUpdatePost(
	postId: PostId,
	content: string,
	user: User,
	displayType: DisplayType
) {
	return await mongoose.connection.transaction(async () => {
		await PostService.incrementCommentCountByPostId(postId, 1);
		const commentCreate: CommentCreate = {
			postId,
			content,
			userId: user._id,
			displayType
		};
		return await CommentService.createCommentByPostId(commentCreate, user);
	});
}

export async function deleteCommentAndUpdatePost(commentId: CommentId, user: User) {
	return await mongoose.connection.transaction(async () => {
		const deletedComment = await CommentService.deleteCommentById(commentId, user);
		await PostService.incrementCommentCountByPostId(deletedComment.postId, -1);
	});
}
