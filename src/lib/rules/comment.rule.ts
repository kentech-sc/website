import type { CommentEntity } from '$lib/types/comment.type.js';
import type { RuleResult } from '$lib/types/general.type.js';
import type { User } from '$lib/types/user.type.js';

import { hasCapability, isOwner } from '$lib/shared/permission.js';
import { APP_ERROR, ok, ruleFail } from '$lib/shared/rule.js';

export function canCreateComment(content: string, user: User): RuleResult {
	if (!hasCapability(user, 'comment.write')) {
		return ruleFail(APP_ERROR.FORBIDDEN, '댓글을 작성할 권한이 없습니다.');
	}

	if (content.trim() === '') {
		return ruleFail(APP_ERROR.BAD_REQUEST, '댓글 내용을 입력해 주세요.');
	}

	return ok();
}

export function canEditOrDeleteComment(comment: CommentEntity, user: User): RuleResult {
	if (isOwner(user, comment.userId) || hasCapability(user, 'comment.moderate')) return ok();
	return ruleFail(APP_ERROR.FORBIDDEN, '댓글을 삭제할 권한이 없습니다.');
}
