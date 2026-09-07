import { desc, eq } from 'drizzle-orm';

import type { Banner } from '$lib/types/banner.type.js';

import { banners, fileMetas } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';
import { FileStorage } from '$lib/server/storage.js';

/** 지금 걸려 있는 배너. 없으면 null. */
export async function findBanner(): Promise<Banner | null> {
	const rows = await getDatabase()
		.select({
			id: banners.id,
			fileId: banners.fileId,
			linkUrl: banners.linkUrl,
			fileName: fileMetas.name,
			fileKey: fileMetas.key
		})
		.from(banners)
		.innerJoin(fileMetas, eq(fileMetas.id, banners.fileId))
		.orderBy(desc(banners.createdAt))
		.limit(1);

	const row = rows[0];
	if (!row) return null;

	return {
		id: row.id,
		fileId: row.fileId,
		linkUrl: row.linkUrl,
		imageAlt: row.fileName,
		imagePath: FileStorage.getUrl(row.fileKey)
	};
}

/** 배너는 한 번에 하나만 건다. 새로 올리면 기존 것을 지우고 대체한다. */
export async function replaceBanner(fileId: string, linkUrl: string | null): Promise<void> {
	await getDatabase().transaction(async (tx) => {
		await tx.delete(banners);
		await tx.insert(banners).values({ fileId, linkUrl });
	});
}

export async function deleteBanner(): Promise<void> {
	await getDatabase().delete(banners);
}
