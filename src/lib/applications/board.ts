import type { PostId } from '$lib/board/types';
import BoardService from '$lib/board/service';
import UserService from '$lib/user/service';
import type { Post, Comment } from '$lib/board/types';

export default class BoardApplication {
	static async getPostAndCommentsByPostId(
		postId: PostId
	): Promise<{ post: Post; comments: Comment[] }> {
		const postRaw = await BoardService.getPostById(postId);
		const commentsRaw = (await BoardService.getCommentsByPostId(postId)).toReversed();

		const raws = [postRaw, ...commentsRaw];
		const filled = await UserService.fillDisplayNames(raws);

		const post = filled[0] as Post;
		const comments = filled.slice(1) as Comment[];

		return { post, comments };
	}
}
