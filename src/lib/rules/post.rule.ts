import type { BoardId } from '$lib/types/board.type.js';
import type { Post } from '$lib/types/post.type.js';
import type { User } from '$lib/types/user.type.js';

import { hasCapability, isOwner } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail, type RuleResult } from '$lib/shared/rule.js';

export function canCreatePost(boardId: BoardId, user: User): RuleResult {
	if (boardId === 'free' && hasCapability(user, 'board.free.write')) return ok();
	if (boardId === 'notice' && hasCapability(user, 'board.notice.write')) return ok();
	if (boardId === 'bylaw' && hasCapability(user, 'board.bylaw.write')) return ok();

	return ruleFail(APP_ERROR.FORBIDDEN, '게시글을 작성할 권한이 없습니다.');
}

export function canEditOrDeletePost(post: Post, user: User): RuleResult {
	if (isOwner(user, post.userId) || hasCapability(user, 'post.moderate')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '게시글을 수정하거나 삭제할 권한이 없습니다.');
}

export function canLikePost(user: User): RuleResult {
	if (hasCapability(user, 'post.like')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '좋아요를 누를 권한이 없습니다.');
}
