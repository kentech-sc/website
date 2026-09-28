import { and, asc, eq, gte, lte, sql } from 'drizzle-orm';

import type { StudentAcademicProfile } from '$lib/types/academic.type.js';
import type { GraduationPolicy } from '$lib/types/degree.type.js';
import type { UserId } from '$lib/types/user.type.js';

import { graduationPolicies, studentAcademicProfiles } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';
export async function findGraduationPolicy(
	admissionYear: number
): Promise<GraduationPolicy | null> {
	const rows = await getDatabase()
		.select()
		.from(graduationPolicies)
		.where(
			and(
				lte(graduationPolicies.admissionYearFrom, admissionYear),
				gte(graduationPolicies.admissionYearTo, admissionYear)
			)
		)
		.orderBy(asc(graduationPolicies.admissionYearFrom))
		.limit(1);
	return rows[0] ?? null;
}

export async function findAcademicProfile(userId: UserId): Promise<StudentAcademicProfile | null> {
	const rows = await getDatabase()
		.select()
		.from(studentAcademicProfiles)
		.where(eq(studentAcademicProfiles.userId, userId))
		.limit(1);
	return rows[0] ?? null;
}

export async function upsertAcademicProfile(
	profile: StudentAcademicProfile
): Promise<StudentAcademicProfile> {
	const [row] = await getDatabase()
		.insert(studentAcademicProfiles)
		.values(profile)
		.onConflictDoUpdate({
			target: studentAcademicProfiles.userId,
			set: {
				admissionYear: profile.admissionYear,
				espWaivedCourseIds: profile.espWaivedCourseIds,
				hideGrades: profile.hideGrades,
				updatedAt: sql`now()`
			}
		})
		.returning();
	return row;
}

export async function updateGradeVisibility(userId: UserId, hideGrades: boolean): Promise<boolean> {
	const rows = await getDatabase()
		.update(studentAcademicProfiles)
		.set({ hideGrades, updatedAt: sql`now()` })
		.where(eq(studentAcademicProfiles.userId, userId))
		.returning({ userId: studentAcademicProfiles.userId });
	return rows.length > 0;
}
