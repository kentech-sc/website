import type { Banner, BannerRow } from '$lib/types/banner.type.js';
import type { User } from '$lib/types/user.type.js';

import * as BannerRepository from '$lib/repositories/banner.repository.js';
import * as BannerRule from '$lib/rules/banner.rule.js';
import { AppError, assertRule } from '$lib/server/errors.js';
import { FileStorage } from '$lib/server/storage.js';
import { APP_ERROR } from '$lib/shared/rule.js';

// 공개 URL 만드는 방식은 file-meta.service 와 같다.
function toBanner(row: BannerRow): Banner {
	return {
		id: row.id,
		fileId: row.fileId,
		linkUrl: row.linkUrl,
		isActive: row.isActive,
		position: row.position,
		imageAlt: row.fileName,
		imagePath: FileStorage.getUrl(row.fileKey)
	};
}

/** 메인 슬라이드에 나오는 배너. 슬라이드 순서대로. */
export async function findActiveBanners(): Promise<Banner[]> {
	const rows = await BannerRepository.findActiveBanners();
	return rows.map(toBanner);
}

/** 관리 화면에서 보여줄 보관함 전체. */
export async function findBanners(user: User): Promise<Banner[]> {
	assertRule(BannerRule.canManageBanner(user));
	const rows = await BannerRepository.findBanners();
	return rows.map(toBanner);
}

export async function addBanner(fileId: string, linkUrl: string | null, user: User): Promise<void> {
	assertRule(BannerRule.canManageBanner(user));

	if (!fileId.trim()) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '배너 이미지가 필요합니다.');
	}

	await BannerRepository.addBanner(fileId, normalizeLinkUrl(linkUrl));
}

export async function setBannerActive(
	bannerId: string,
	isActive: boolean,
	user: User
): Promise<void> {
	assertRule(BannerRule.canManageBanner(user));
	await BannerRepository.setBannerActive(bannerId, isActive);
}

export async function reorderBanners(bannerIds: string[], user: User): Promise<void> {
	assertRule(BannerRule.canManageBanner(user));

	if (!bannerIds.length) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '저장할 순서가 없습니다.');
	}

	if (new Set(bannerIds).size !== bannerIds.length) {
		throw new AppError(APP_ERROR.BAD_REQUEST, '같은 배너가 순서에 두 번 들어 있습니다.');
	}

	await BannerRepository.reorderBanners(bannerIds);
}

export async function deleteBanner(bannerId: string, user: User): Promise<void> {
	assertRule(BannerRule.canManageBanner(user));
	await BannerRepository.deleteBanner(bannerId);
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
