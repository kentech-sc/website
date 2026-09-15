import {
	AuditReportStatus,
	type AuditReportStatus as AuditReportStatusType
} from '$lib/types/audit-report.type.js';

export const AUDIT_REPORT_STATUS_LABELS: Record<AuditReportStatusType, string> = {
	[AuditReportStatus.Received]: '접수',
	[AuditReportStatus.Reviewing]: '검토 중',
	[AuditReportStatus.Closed]: '종결'
};

export function isAuditReportStatus(value: string): value is AuditReportStatusType {
	return Object.hasOwn(AUDIT_REPORT_STATUS_LABELS, value);
}
