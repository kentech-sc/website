import { json } from '@sveltejs/kit';

import { env as privateEnv } from '$env/dynamic/private';
import * as FileMetaService from '$lib/services/file-meta.service.js';

const ORPHAN_AGE_HOURS = 24;

function isAuthorizedCronRequest(request: Request): boolean {
	return request.headers.get('authorization') === `Bearer ${privateEnv.CRON_SECRET}`;
}

export const GET = async ({ request }) => {
	if (!privateEnv.CRON_SECRET || !isAuthorizedCronRequest(request)) {
		return json({ message: '허용되지 않은 요청입니다.' }, { status: 401 });
	}

	try {
		const deletedCount = await FileMetaService.cleanupOrphanedFilesAsSystem(ORPHAN_AGE_HOURS);
		return json({ ok: true, deletedCount, olderThanHours: ORPHAN_AGE_HOURS });
	} catch (error) {
		console.error('Scheduled orphaned file cleanup failed.', error);
		return json({ message: '고아 파일 정리에 실패했습니다.' }, { status: 500 });
	}
};
