import type { Banner } from '$lib/types/banner.type.js';
import type { User } from '$lib/types/user.type.js';

import * as BannerRepository from '$lib/repositories/banner.repository.js';
import * as BannerRule from '$lib/rules/banner.rule.js';
import { AppError, assertRule } from '$lib/server/errors.js';
import { APP_ERROR } from '$lib/shared/rule.js';

export async function findBanner(): Promise<Banner | null> {
	return await BannerRepository.findBanner();
}

export async function replaceBanner(
	fileId: string,
	linkUrl: string | null,
	user: User
): Promise<void> {
	assertRule(BannerRule.canManageBanner(user));

	if (!fileId.trim()) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '배너 이미지가 필요합니다.');
	}

	await BannerRepository.replaceBanner(fileId, normalizeLinkUrl(linkUrl));
}

export async function deleteBanner(user: User): Promise<void> {
	assertRule(BannerRule.canManageBanner(user));
	await BannerRepository.deleteBanner();
}

/** 빈 값은 링크 없음으로 두고, 주소 형식이 아니면 막는다. */
function normalizeLinkUrl(linkUrl: string | null): string | null {
	const trimmed = linkUrl?.trim();
	if (!trimmed) return null;

	if (!/^https?:\/\//.test(trimmed)) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '링크는 http:// 또는 https:// 로 시작해야 합니다.');
	}

	return trimmed;
}
