<script lang="ts">
	import type { AuditReportEntity } from '$lib/types/audit-report.type.js';

	import { resolve } from '$app/paths';
	import { AUDIT_REPORT_STATUS_LABELS } from '$lib/shared/audit-report.js';
	import { parseDate } from '$lib/shared/utils.js';

	let { reports }: { reports: AuditReportEntity[] } = $props();
</script>

<section class="module report-list">
	{#if reports.length === 0}
		<p>접수된 제보가 없습니다.</p>
	{:else}
		{#each reports as report (report.id)}
			<a href={resolve('/channel/audit/manage/[reportId]', { reportId: report.id })}>
				<span class="status-badge">{AUDIT_REPORT_STATUS_LABELS[report.status]}</span>
				<strong>{report.title}</strong>
				<time datetime={report.createdAt}>{parseDate(report.createdAt, 'date')}</time>
			</a>
		{/each}
	{/if}
</section>

<style lang="scss">
	.report-list {
		padding: 0;
		overflow: hidden;
	}

	a {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.6rem;
		border-bottom: solid 0.1rem var(--gray-border);
		padding: 0.8rem 1rem;
		color: var(--black);
		text-decoration: none;
	}

	a:hover {
		background: var(--gray-bg);
	}

	strong {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	time {
		color: var(--gray);
		font-size: 0.8rem;
	}
</style>
