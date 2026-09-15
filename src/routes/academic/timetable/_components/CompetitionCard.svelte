<script lang="ts">
	import Clock from '@lucide/svelte/icons/clock-3';
	import Users from '@lucide/svelte/icons/users';

	import type { Offering } from '$lib/types/academic.type.js';

	let {
		competition
	}: {
		competition: {
			confirmed: boolean;
			confirmedTimetableName: string | null;
			confirmedTimetableCount: number;
			items: Array<{ offering: Offering; applicants: number }>;
		};
	} = $props();
</script>

<section class="module competition-card">
	<div class="competition-heading">
		<Users size="1.2rem" />
		<div class="competition-heading-copy">
			<h2>수강 희망 경쟁률</h2>
			<p>확정된 시간표에 담긴 강의만 표시됩니다.</p>
		</div>
		{#if competition.confirmed}
			<div
				class="competition-sample"
				aria-label={`확정 시간표 ${competition.confirmedTimetableCount}개 기준`}
			>
				<span>확정 시간표</span>
				<strong>{competition.confirmedTimetableCount}개</strong>
			</div>
		{/if}
	</div>
	{#if !competition.confirmed}
		<div class="competition-empty">
			<Clock size="1.1rem" /><span
				>시간표 하나를 확정하면 해당 강의의 경쟁률을 확인할 수 있습니다.</span
			>
		</div>
	{:else}
		<p class="competition-slot">내 시간표 · {competition.confirmedTimetableName}</p>
		{#if !competition.items.length}
			<div class="competition-empty"><span>확정 시간표에 등록된 강의가 없습니다.</span></div>
		{:else}
			<div class="competition-list">
				{#each competition.items as item (item.offering.id)}
					<div class="competition-row">
						<span class="competition-course"
							><b>{item.offering.courseName}</b><small
								>{item.offering.courseId} · {item.offering.section}분반</small
							></span
						><span class="competition-value"><b>{item.applicants}명</b><small>희망</small></span
						><span class="competition-value"
							><b>{item.offering.capacity === null ? '–' : `${item.offering.capacity}명`}</b><small
								>정원</small
							></span
						><strong class="competition-ratio"
							>{item.offering.capacity
								? `${(item.applicants / item.offering.capacity).toFixed(2)} : 1`
								: '–'}</strong
						>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</section>

<style lang="scss">
	.competition-card {
		padding: 0.8rem;
	}
	.competition-heading,
	.competition-empty {
		display: flex;
		align-items: center;
	}
	.competition-heading {
		gap: 0.4rem;
	}
	.competition-heading > :global(svg) {
		color: var(--secondary);
	}
	.competition-heading-copy h2,
	.competition-heading-copy p {
		margin: 0;
	}
	.competition-heading-copy h2 {
		font-size: 0.9rem;
	}
	.competition-heading-copy p {
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.competition-sample {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		gap: 0.4rem;
		margin-left: auto;
		border-radius: 0.4rem;
		background: var(--gray-bg);
		padding: 0.4rem;
		color: var(--gray-text);
	}
	.competition-sample span {
		font-size: 0.6rem;
	}
	.competition-sample strong {
		color: var(--secondary);
		font-size: 0.8rem;
		line-height: 1;
	}
	.competition-empty {
		justify-content: center;
		gap: 0.4rem;
		margin-top: 0.6rem;
		border-radius: 0.5rem;
		background: var(--gray-bg);
		padding: 0.8rem;
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.competition-slot {
		margin: 0.4rem 0;
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.competition-list {
		border-top: var(--divider-border-width) solid var(--gray-border);
	}
	.competition-row {
		display: grid;
		grid-template-columns: 1fr 4rem 4rem 5rem;
		align-items: center;
		gap: 0.4rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		padding: 0.6rem 0;
	}
	.competition-course,
	.competition-value {
		display: flex;
		flex-direction: column;
	}
	.competition-row b {
		font-size: 0.7rem;
	}
	.competition-row small {
		color: var(--gray-text);
		font-size: 0.6rem;
	}
	.competition-ratio {
		color: var(--secondary);
		font-size: 0.8rem;
		text-align: right;
	}
	@media (max-width: 650px) {
		.competition-row {
			grid-template-columns: 1fr 3rem 3rem 4rem;
		}
	}
</style>
