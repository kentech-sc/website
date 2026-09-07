import { desc, eq } from 'drizzle-orm';

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
			fileName: fileMetas.name,
			fileKey: fileMetas.key
		})
		.from(banners)
		.innerJoin(fileMetas, eq(fileMetas.id, banners.fileId));
}

/** 지금 메인에 걸려 있는 배너. 없으면 null. */
export async function findActiveBanner(): Promise<BannerRow | null> {
	const rows = await selectBanners().where(eq(banners.isActive, true)).limit(1);
	return rows[0] ?? null;
}

/** 보관함 전체. 최근에 올린 것부터. */
export async function findBanners(): Promise<BannerRow[]> {
	return await selectBanners().orderBy(desc(banners.createdAt));
}

/** 올리면서 바로 건다. */
export async function addBanner(fileId: string, linkUrl: string | null): Promise<void> {
	await getDatabase().transaction(async (tx) => {
		await tx.update(banners).set({ isActive: false }).where(eq(banners.isActive, true));
		await tx.insert(banners).values({ fileId, linkUrl, isActive: true });
	});
}

/** 보관함에 있는 다른 배너로 갈아 건다. 활성은 항상 하나뿐이다. */
export async function activateBanner(bannerId: string): Promise<void> {
	await getDatabase().transaction(async (tx) => {
		await tx.update(banners).set({ isActive: false }).where(eq(banners.isActive, true));
		await tx.update(banners).set({ isActive: true }).where(eq(banners.id, bannerId));
	});
}

/** 보관함에서 지운다. 파일은 참조가 끊긴 뒤 정리 cron 이 지운다. */
export async function deleteBanner(bannerId: string): Promise<void> {
	await getDatabase().delete(banners).where(eq(banners.id, bannerId));
}
