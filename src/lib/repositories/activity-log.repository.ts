import type { ActivityLogCreate, ActivityLogEntity } from '$lib/types/activity-log.type.js';

import { ActivityLogModel } from '$lib/models/activity-log.model.js';
import { toPojo } from '$lib/shared/utils.js';

export async function createActivityLog(
	activityLog: ActivityLogCreate
): Promise<ActivityLogEntity> {
	return toPojo<ActivityLogEntity>((await ActivityLogModel.create(activityLog)).toObject());
}

export async function createActivityLogs(
	activityLogs: ActivityLogCreate[]
): Promise<ActivityLogEntity[]> {
	if (activityLogs.length === 0) return [];

	const createdLogs = await ActivityLogModel.create(activityLogs);
	return toPojo<ActivityLogEntity[]>(createdLogs.map((activityLog) => activityLog.toObject()));
}
