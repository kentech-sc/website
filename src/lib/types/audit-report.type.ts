export const AuditReportStatus = {
	Received: 'received',
	Reviewing: 'reviewing',
	Closed: 'closed'
} as const;

export type AuditReportStatus = (typeof AuditReportStatus)[keyof typeof AuditReportStatus];
export type AuditReportId = string;

export interface AuditReportCreate {
	title: string;
	content: string;
}

export interface AuditReportEntity extends AuditReportCreate {
	id: AuditReportId;
	status: AuditReportStatus;
	createdAt: string;
	updatedAt: string;
}
