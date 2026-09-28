import { eq } from 'drizzle-orm';

import type { UserId } from '$lib/types/user.type.js';

import { courseRecords, studentAcademicProfiles, timetables } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';
export async function deleteStudentData(userId: UserId): Promise<void> {
	await getDatabase().delete(courseRecords).where(eq(courseRecords.userId, userId));
	await getDatabase()
		.delete(studentAcademicProfiles)
		.where(eq(studentAcademicProfiles.userId, userId));
	await getDatabase().delete(timetables).where(eq(timetables.userId, userId));
}
