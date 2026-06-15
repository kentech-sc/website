import type { ActivityLog, ActivityLogCreate } from '$lib/types/activity-log.type.js';

import { ActivityLogModel } from '$lib/models/activity-log.model.js';
import { toPojo } from '$lib/shared/utils.js';

export async function createActivityLog(activityLog: ActivityLogCreate): Promise<ActivityLog> {
	return toPojo<ActivityLog>((await ActivityLogModel.create(activityLog)).toObject());
}

export async function createActivityLogs(
	activityLogs: ActivityLogCreate[]
): Promise<ActivityLog[]> {
	if (activityLogs.length === 0) return [];

	const createdLogs = await ActivityLogModel.create(activityLogs);
	return toPojo<ActivityLog[]>(createdLogs.map((activityLog) => activityLog.toObject()));
}
