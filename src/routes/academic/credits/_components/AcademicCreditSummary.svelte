<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';

	import type { PageData } from '../$types.js';

	let {
		progress,
		profile
	}: {
		progress: NonNullable<PageData['degreeProgress']>;
		profile: PageData['academicProfile'];
	} = $props();

	const percent = (value: number, required: number) =>
		required <= 0 ? 100 : Math.min(100, Math.round((value / required) * 100));
	const earned = (category: string) => (progress.earned as Record<string, number>)[category] ?? 0;
	const categories = $derived(
		Object.entries(progress.required).filter(([category]) => category !== 'total')
	);
	const totalPercent = $derived(percent(progress.earned.total, progress.required.total));
</script>

<section class="module academic-credit-summary">
	<div class="total-credit-progress">
		<div
			class="progress-ring"
			class:is-complete={totalPercent >= 100}
			style={`--progress: ${totalPercent * 3.6}deg`}
		>
			<div><strong>{totalPercent}%</strong><span>졸업학점</span></div>
		</div>
		<div class="total-credit-copy">
			{#if profile}
				<div class="academic-basis">
					<GraduationCap size="0.8rem" />
					<span>{profile.admissionYear}학번</span><i></i>
					<span>ESP 면제 {profile.espWaivedCourseIds.length}과목</span>
				</div>
			{/if}
			<span>총 이수 학점</span>
			<strong>{progress.earned.total}<small> / {progress.required.total}학점</small></strong>
			<p class:is-complete={totalPercent >= 100}>
				{totalPercent >= 100
					? '졸업학점을 모두 이수했습니다.'
					: `${Math.max(0, progress.required.total - progress.earned.total)}학점이 남았습니다.`}
			</p>
		</div>
	</div>

	<div class="category-credit-progress">
		{#each categories as [category, required] (category)}
			{@const complete = earned(category) >= required}
			<div class="category-requirement" class:is-complete={complete}>
				<div class="category-code">
					<span>{category}</span>
					{#if complete}<Check size="0.7rem" aria-label="요건 충족" />{/if}
				</div>
				<div
					class="progress-track category-progress-bar"
					aria-label={`${category} ${earned(category)} / ${required}학점`}
				>
					<i class="progress-fill" style={`width: ${percent(earned(category), required)}%`}></i>
				</div>
				<b>{Math.min(earned(category), required)}<small>/{required}</small></b>
			</div>
		{/each}
	</div>
</section>

<style lang="scss">
	.academic-credit-summary {
		display: grid;
		grid-template-columns: minmax(13rem, 0.8fr) minmax(20rem, 1.4fr);
		gap: 1.2rem;
		padding: 1.2rem;
	}
	.total-credit-progress {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		border-right: var(--divider-border-width) solid var(--gray-border);
	}
	.progress-ring {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 50%;
		background: conic-gradient(var(--secondary) var(--progress), var(--gray-bg) 0);
		width: 5.7rem;
		height: 5.7rem;
	}
	.progress-ring.is-complete {
		background: var(--success-text);
	}
	.progress-ring::before {
		grid-area: 1/1;
		border-radius: 50%;
		background: var(--white);
		width: 4.6rem;
		height: 4.6rem;
		content: '';
	}
	.progress-ring div,
	.total-credit-copy {
		display: flex;
		flex-direction: column;
	}
	.progress-ring div {
		grid-area: 1/1;
		align-items: center;
		z-index: 1;
	}
	.progress-ring strong {
		font-size: 1.2rem;
	}
	.progress-ring span,
	.total-credit-copy > span,
	.total-credit-copy p {
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.academic-basis {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		margin-bottom: 0.2rem;
		color: var(--secondary);
		font-weight: 600;
		font-size: 0.6rem;
		white-space: nowrap;
	}
	.academic-basis i {
		border-radius: 50%;
		background: var(--gray-border);
		width: 0.2rem;
		height: 0.2rem;
	}
	.total-credit-copy strong {
		font-size: 1.6rem;
	}
	.total-credit-copy strong small {
		color: var(--gray-text);
		font-weight: 500;
		font-size: 0.7rem;
	}
	.total-credit-copy p {
		margin: 0.2rem 0 0;
	}
	.total-credit-copy p.is-complete {
		color: var(--success-text);
		font-weight: 600;
	}
	.category-credit-progress {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-content: center;
		gap: 0.6rem 1rem;
	}
	.category-requirement {
		display: grid;
		grid-template-columns: minmax(2.8rem, auto) 1fr 2.7rem;
		align-items: center;
		gap: 0.4rem;
	}
	.category-code {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		font-weight: 650;
		font-size: 0.7rem;
	}
	.category-code :global(svg),
	.category-requirement.is-complete {
		color: var(--success-text);
	}
	.category-requirement small {
		color: var(--gray-text);
		font-weight: 500;
		font-size: 0.6rem;
	}
	.category-requirement > b {
		font-size: 0.7rem;
		text-align: right;
	}
	.category-progress-bar {
		height: 0.4rem;
	}
	.category-requirement.is-complete .category-progress-bar i {
		background: var(--success-text);
	}
	@media (max-width: 850px) {
		.academic-credit-summary {
			grid-template-columns: 1fr;
		}
		.total-credit-progress {
			border-right: 0;
		}
	}
	@media (max-width: 620px) {
		.category-credit-progress {
			grid-template-columns: 1fr;
		}
	}
</style>
