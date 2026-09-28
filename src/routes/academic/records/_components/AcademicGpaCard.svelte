<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';

	import SectionHeading from './SectionHeading.svelte';

	import type { GpaSummary } from '$lib/shared/gpa.js';
	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';

	let {
		gpa,
		gpaByTerm,
		initiallyHidden
	}: {
		gpa: GpaSummary;
		gpaByTerm: Array<GpaSummary & { year: number; term: number }>;
		initiallyHidden: boolean;
	} = $props();
	let hideGrades = $derived(initiallyHidden);

	const termLabel = (term: number) => ['1학기', '2학기', '하계', '동계'][term - 1] ?? `${term}학기`;
	const gradeVisibilityEnhance: SubmitFunction = () => {
		hideGrades = !hideGrades;
		return async ({ result, update }) => {
			if (result.type === 'failure') hideGrades = !hideGrades;
			await update({ reset: false });
		};
	};
</script>

<details class="module is-flush gpa-card">
	<summary aria-label="누적 평점평균 및 학기별 평점평균 펼치기">
		<SectionHeading
			icon={GraduationCap}
			title="누적 평점평균"
			description={`성적이 등록된 ${gpa.courseCount}과목 · 평점 반영 ${gpa.gradedCredits}학점`}
		/>
		<strong class="gpa-value"
			>{hideGrades ? '••••' : gpa.value.toFixed(2)}{#if !hideGrades}<small>
					/ 4.30</small
				>{/if}</strong
		>
		<form method="POST" action="?/setGradeVisibility" use:enhance={gradeVisibilityEnhance}>
			<input type="hidden" name="hideGrades" value={String(!hideGrades)} />
			<button
				type="submit"
				class="ui-button is-icon grade-visibility"
				aria-pressed={hideGrades}
				aria-label={hideGrades ? '평점 표시' : '평점 숨기기'}
				title={hideGrades ? '평점 표시' : '평점 숨기기'}
				onclick={(event) => event.stopPropagation()}
			>
				{#if hideGrades}<Eye size="0.9rem" />{:else}<EyeOff size="0.9rem" />{/if}
			</button>
		</form>
		<span class="disclosure-icon"><ChevronDown size="0.9rem" /></span>
	</summary>
	<div class="term-gpa-list" aria-label="학기별 평점평균">
		{#each [...gpaByTerm].reverse() as termGpa (`${termGpa.year}-${termGpa.term}`)}
			<article>
				<span>{termGpa.year}년 {termLabel(termGpa.term)}</span>
				<strong
					>{hideGrades ? '••••' : termGpa.value.toFixed(2)}{#if !hideGrades}<small>
							/ 4.30</small
						>{/if}</strong
				>
				<small>{termGpa.gradedCredits}학점 · {termGpa.courseCount}과목</small>
			</article>
		{/each}
	</div>
</details>

<style lang="scss">
	.gpa-value {
		flex: 0 0 auto;
		margin-left: auto;
		font-size: 0.9rem;
		line-height: 1.1;
	}
	.gpa-value small {
		color: var(--gray-text);
		font-weight: 500;
		font-size: 0.7rem;
	}
	summary > form {
		display: flex;
		flex: 0 0 auto;
	}
	.grade-visibility {
		padding: 0.2rem;
	}
	.term-gpa-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
		gap: 0.6rem;
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding: 0.8rem;
	}
	.term-gpa-list article {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		border: var(--divider-border-width) solid transparent;
		border-radius: 1.4rem;
		background: var(--gray-bg);
		padding: 0.6rem;
	}
	.term-gpa-list article > span {
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.term-gpa-list strong {
		font-size: 0.9rem;
	}
	.term-gpa-list strong small,
	.term-gpa-list article > small {
		color: var(--gray-text);
		font-weight: 500;
		font-size: 0.7rem;
	}
</style>
