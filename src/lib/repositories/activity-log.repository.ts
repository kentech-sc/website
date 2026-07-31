import { asEntity } from './repository.utils.js';

import type { ActivityLogCreate, ActivityLogEntity } from '$lib/types/activity-log.type.js';

import { activityLogs } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

export async function createActivityLog(
	activityLog: ActivityLogCreate
): Promise<ActivityLogEntity> {
	const [created] = await getDatabase().insert(activityLogs).values(activityLog).returning();
	return asEntity<ActivityLogEntity>(created);
}

export async function createActivityLogs(logs: ActivityLogCreate[]): Promise<ActivityLogEntity[]> {
	if (logs.length === 0) return [];
	return asEntity<ActivityLogEntity[]>(
		await getDatabase().insert(activityLogs).values(logs).returning()
	);
}
