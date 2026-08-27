<script lang="ts">
	import BookOpenCheck from '@lucide/svelte/icons/book-open-check';
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	import type { PageData } from '../$types.js';

	let {
		progress,
		espCourses
	}: {
		progress: NonNullable<PageData['degreeProgress']>;
		espCourses: Array<{ id: string; name: string; waived: boolean; completed: boolean }>;
	} = $props();

	const percent = (value: number, required: number) =>
		required <= 0 ? 100 : Math.min(100, Math.round((value / required) * 100));
	const espProgress = $derived(
		progress.sequenceProgress.find((item) => item.category === 'ESP') ?? null
	);
	const espCourseNames = $derived(new Map(espCourses.map((course) => [course.id, course.name])));
	const requirements = $derived(
		(
			[
				['ef-math', 'EF 수학', progress.efSub.math, progress.efSubRequired.math],
				['ef-physics', 'EF 물리', progress.efSub.physics, progress.efSubRequired.physics],
				['ef-chemistry', 'EF 화학', progress.efSub.chemistry, progress.efSubRequired.chemistry],
				[
					'ef-data-literacy',
					'EF 데이터 리터러시',
					progress.efSub.dataLiteracy,
					progress.efSubRequired.dataLiteracy
				],
				['el-upper', 'EL 4·5레벨', progress.elUpperCredits, progress.elUpperRequiredCredits]
			] satisfies Array<[string, string, number, number]>
		).map(([key, label, value, required]) => ({ key, label, value, required }))
	);
	const satisfiedCount = $derived(
		requirements.filter((item) => item.value >= item.required).length +
			(espProgress?.completedStageCount === espProgress?.totalStageCount ? 1 : 0)
	);
	const requirementCount = $derived(requirements.length + (espProgress ? 1 : 0));
</script>

<details class="module is-flush requirement-details">
	<summary>
		<BookOpenCheck size="1rem" />
		<span class="requirement-summary">
			<b>세부 이수 요건</b>
			<small
				>EF 세부 분야, EL 상위 레벨, ESP 6개 수업 · {satisfiedCount}/{requirementCount}개 충족</small
			>
		</span>
		<span class="disclosure-icon"><ChevronDown size="0.9rem" /></span>
	</summary>

	<div class="requirement-grid">
		{#each requirements as item (item.key)}
			{@const complete = item.value >= item.required}
			<div class="requirement-card" class:is-complete={complete}>
				<div class="requirement-label">
					<span>{item.label}</span><small>{complete ? '충족' : '미충족'}</small>
				</div>
				<b>{item.value}<small>/{item.required} 학점</small></b>
				<div
					class="progress-track requirement-progress"
					role="progressbar"
					aria-label={`${item.label} 이수 현황`}
					aria-valuemin="0"
					aria-valuemax={item.required}
					aria-valuenow={Math.min(item.value, item.required)}
				>
					<i class="progress-fill" style={`width: ${percent(item.value, item.required)}%`}></i>
				</div>
			</div>
		{/each}

		{#if espProgress}
			{@const complete = espProgress.completedStageCount === espProgress.totalStageCount}
			<div class="requirement-card esp-requirement" class:is-complete={complete}>
				<div class="requirement-label">
					<span>ESP 필수 수업</span><small>{complete ? '충족' : '미충족'}</small>
				</div>
				<b>{espProgress.completedCount}/{espProgress.totalCount}<small>수업</small></b>
				<div
					class="progress-track requirement-progress"
					role="progressbar"
					aria-label="ESP 필수 수업 이수 현황"
					aria-valuemin="0"
					aria-valuemax={espProgress.totalCount}
					aria-valuenow={espProgress.completedCount}
				>
					<i
						class="progress-fill"
						style={`width: ${percent(espProgress.completedCount, espProgress.totalCount)}%`}
					></i>
				</div>
				<div class="esp-course-list">
					{#each espCourses as course (course.id)}
						<span class:is-complete={course.completed || course.waived}>
							{#if course.completed || course.waived}<Check size="0.7rem" />{/if}
							<b>{course.name}</b>
							{#if course.waived}<small>면제</small>{:else if course.completed}<small>이수</small
								>{/if}
						</span>
					{/each}
				</div>
				<p>
					{espProgress.availableCourseIds.length
						? `다음 수업: ${espProgress.availableCourseIds.map((id) => espCourseNames.get(id) ?? id).join(', ')}`
						: '필수 6개 수업 완료'}
				</p>
			</div>
		{/if}
	</div>
</details>

<style lang="scss">
	summary {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		cursor: pointer;
		padding: 0.8rem;
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary > :global(svg) {
		color: var(--secondary);
	}
	.requirement-summary {
		display: flex;
		flex: 1;
		flex-direction: column;
	}
	.requirement-summary small {
		color: var(--gray-text);
		font-weight: 400;
		font-size: 0.7rem;
	}
	.requirement-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
		gap: 0.4rem;
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding: 0.8rem;
	}
	.requirement-card {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		border: var(--divider-border-width) solid transparent;
		border-radius: 0.6rem;
		background: var(--gray-bg);
		padding: 0.6rem;
	}
	.requirement-card.is-complete {
		border-color: color-mix(in srgb, var(--success-text) 20%, transparent);
		background: var(--success-bg);
	}
	.requirement-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.4rem;
	}
	.requirement-label small {
		border-radius: 999px;
		background: var(--white);
		padding: 0.2rem 0.4rem;
		color: var(--secondary);
		font-weight: 600;
		font-size: 0.6rem;
	}
	.is-complete .requirement-label small {
		color: var(--success-text);
	}
	.requirement-grid span {
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.requirement-grid b {
		font-size: 1rem;
	}
	.requirement-grid b small {
		margin-left: 0.2rem;
		color: var(--gray-text);
		font-size: 0.6rem;
	}
	.requirement-progress {
		height: 0.4rem;
	}
	.requirement-card.is-complete .requirement-progress i {
		background: var(--success-text);
	}
	.esp-requirement {
		grid-column: 1 / -1;
	}
	.esp-course-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
		gap: 0.4rem;
	}
	.esp-course-list > span {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		border: var(--divider-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		background: var(--white);
		padding: 0.4rem;
	}
	.esp-course-list > span.is-complete {
		color: var(--success-text);
	}
	.esp-course-list b {
		flex: 1;
		font-size: 0.6rem;
	}
	.esp-course-list small {
		color: var(--success-text);
		font-size: 0.6rem;
	}
	.esp-requirement p {
		margin: 0.2rem 0 0;
		color: var(--secondary);
		font-size: 0.7rem;
	}
</style>
