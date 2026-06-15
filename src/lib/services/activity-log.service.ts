import type { ActivityLogCreate } from '$lib/types/activity-log.type.js';

import * as ActivityLogRepository from '$lib/repositories/activity-log.repository.js';

export async function create(activityLog: ActivityLogCreate) {
	return await ActivityLogRepository.createActivityLog(activityLog);
}

export async function createMany(activityLogs: ActivityLogCreate[]) {
	return await ActivityLogRepository.createActivityLogs(activityLogs);
}
