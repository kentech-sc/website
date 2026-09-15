<script lang="ts">
	import type { AuditReportEntity } from '$lib/types/audit-report.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import { AUDIT_REPORT_STATUS_LABELS } from '$lib/shared/audit-report.js';
	import { parseDate } from '$lib/shared/utils.js';
	import { AuditReportStatus } from '$lib/types/audit-report.type.js';

	let { report }: { report: AuditReportEntity } = $props();
</script>

<article class="module container-col">
	<header>
		<div class="container meta">
			<span class="status-badge">{AUDIT_REPORT_STATUS_LABELS[report.status]}</span>
			<time datetime={report.createdAt}>{parseDate(report.createdAt, 'datetime')}</time>
		</div>
		<h2>{report.title}</h2>
	</header>

	<p class="content">{report.content}</p>

	<CommonForm actionName="changeStatus" formName="audit-status" policy="reload">
		<input type="hidden" name="reportId" value={report.id} />
		<div class="container status-actions">
			{#each Object.values(AuditReportStatus) as status (status)}
				<button
					type="submit"
					name="status"
					value={status}
					class:action-btn={status !== report.status}
					disabled={status === report.status}
				>
					{AUDIT_REPORT_STATUS_LABELS[status]}
				</button>
			{/each}
		</div>
	</CommonForm>
</article>

<style lang="scss">
	article {
		align-items: stretch;
		gap: 1.2rem;
	}

	header {
		border-bottom: solid 0.1rem var(--gray-border);
		padding-bottom: 1rem;
	}

	.meta {
		justify-content: space-between;
		margin-bottom: 0.6rem;
	}

	time {
		color: var(--gray);
		font-size: 0.8rem;
	}

	.content {
		min-height: 12rem;
		white-space: pre-wrap;
	}

	.status-actions {
		justify-content: flex-end;
		gap: 0.4rem;
	}
</style>
