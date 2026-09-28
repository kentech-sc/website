import { asc, eq, sql } from 'drizzle-orm';

import type { BannerRow } from '$lib/types/banner.type.js';

import { banners, fileMetas } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

/**
 * 공개 URL 변환은 저장소를 다루는 service 에서 한다. (file-meta.service 와 같은 방식)
 */
function selectBanners() {
	return getDatabase()
		.select({
			id: banners.id,
			fileId: banners.fileId,
			linkUrl: banners.linkUrl,
			isActive: banners.isActive,
			position: banners.position,
			fileName: fileMetas.name,
			fileKey: fileMetas.key
		})
		.from(banners)
		.innerJoin(fileMetas, eq(fileMetas.id, banners.fileId));
}

// 순서가 같으면 먼저 올린 것이 앞선다. 관리 화면과 메인 슬라이드가 같은 순서를 쓴다.
const slideOrder = [asc(banners.position), asc(banners.createdAt)];

/** 메인 슬라이드에 나오는 배너. 슬라이드 순서대로. */
export async function findActiveBanners(): Promise<BannerRow[]> {
	return await selectBanners()
		.where(eq(banners.isActive, true))
		.orderBy(...slideOrder);
}

/** 보관함 전체. 슬라이드 순서대로. */
export async function findBanners(): Promise<BannerRow[]> {
	return await selectBanners().orderBy(...slideOrder);
}

/** 올리면서 바로 켜고, 슬라이드 맨 뒤에 붙인다. */
export async function addBanner(fileId: string, linkUrl: string | null): Promise<void> {
	await getDatabase()
		.insert(banners)
		.values({
			fileId,
			linkUrl,
			isActive: true,
			position: sql`(select coalesce(max(${banners.position}) + 1, 0) from ${banners})`
		});
}

/** 슬라이드에 넣거나 뺀다. 순서는 그대로 둔다. */
export async function setBannerActive(bannerId: string, isActive: boolean): Promise<void> {
	await getDatabase().update(banners).set({ isActive }).where(eq(banners.id, bannerId));
}

/**
 * 관리 화면에서 정한 순서대로 0 부터 다시 매긴다.
 * 그 사이 누가 새로 올린 배너처럼 목록에 없는 것은 기존 순서를 지킨 채 뒤로 보낸다.
 */
export async function reorderBanners(bannerIds: string[]): Promise<void> {
	await getDatabase().transaction(async (tx) => {
		const existing = await tx
			.select({ id: banners.id })
			.from(banners)
			.orderBy(...slideOrder);

		const existingIds = new Set(existing.map((row) => row.id));
		const requested = bannerIds.filter((id) => existingIds.has(id));
		const requestedIds = new Set(requested);
		const rest = existing.map((row) => row.id).filter((id) => !requestedIds.has(id));

		for (const [position, id] of [...requested, ...rest].entries()) {
			await tx.update(banners).set({ position }).where(eq(banners.id, id));
		}
	});
}

/** 보관함에서 지운다. 파일은 참조가 끊긴 뒤 정리 cron 이 지운다. */
export async function deleteBanner(bannerId: string): Promise<void> {
	await getDatabase().delete(banners).where(eq(banners.id, bannerId));
}
