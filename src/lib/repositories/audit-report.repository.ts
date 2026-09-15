import { desc, eq, sql } from 'drizzle-orm';

import type {
	AuditReportCreate,
	AuditReportEntity,
	AuditReportId,
	AuditReportStatus
} from '$lib/types/audit-report.type.js';

import { firstOrNull } from '$lib/repositories/repository.utils.js';
import { auditReports } from '$lib/server/database/schema.js';
import { getDatabase } from '$lib/server/db.js';

function toEntity(row: typeof auditReports.$inferSelect): AuditReportEntity {
	return { ...row, status: row.status as AuditReportStatus };
}

export async function createAuditReport(input: AuditReportCreate): Promise<AuditReportEntity> {
	const [row] = await getDatabase().insert(auditReports).values(input).returning();
	return toEntity(row);
}

export async function findAuditReports(limit = 50): Promise<AuditReportEntity[]> {
	const rows = await getDatabase()
		.select()
		.from(auditReports)
		.orderBy(desc(auditReports.createdAt))
		.limit(limit);
	return rows.map(toEntity);
}

export async function findAuditReportById(id: AuditReportId): Promise<AuditReportEntity | null> {
	const row = firstOrNull(
		await getDatabase().select().from(auditReports).where(eq(auditReports.id, id)).limit(1)
	);
	return row ? toEntity(row) : null;
}

export async function updateAuditReportStatus(
	id: AuditReportId,
	status: AuditReportStatus
): Promise<AuditReportEntity | null> {
	const row = firstOrNull(
		await getDatabase()
			.update(auditReports)
			.set({ status, updatedAt: sql`now()` })
			.where(eq(auditReports.id, id))
			.returning()
	);
	return row ? toEntity(row) : null;
}
