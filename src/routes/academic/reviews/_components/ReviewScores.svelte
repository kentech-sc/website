<script lang="ts">
	import type { ReviewScore } from '$lib/types/review.type.js';

	import StarRating from '$components/StarRating.svelte';
	let {
		scores = $bindable(),
		loading
	}: {
		scores: ReviewScore;
		loading: boolean;
	} = $props();
	function getAmountLabel(value: number): string {
		if (value <= 1) return '매우 적음';
		if (value <= 2) return '적음';
		if (value <= 3) return '보통';
		if (value <= 4) return '많음';
		return '매우 많음';
	}

	function getDifficultyLabel(value: number): string {
		if (value <= 1) return '매우 쉬움';
		if (value <= 2) return '쉬움';
		if (value <= 3) return '보통';
		if (value <= 4) return '어려움';
		return '매우 어려움';
	}
</script>

<section class="review-score-section">
	<div class="review-slider-row">
		{#snippet scoreInput(key: 'assignment' | 'lecture' | 'exam', label: string, difficulty = false)}
			<div class="review-score-item">
				<div class="review-label-row">
					<label for={`${key}Score`}>{label}</label><span class="review-current-label"
						>{difficulty ? getDifficultyLabel(scores[key]) : getAmountLabel(scores[key])}</span
					>
				</div>
				<input
					class="review-range"
					type="range"
					id={`${key}Score`}
					name={`${key}Score`}
					min="1"
					max="5"
					step="1"
					bind:value={scores[key]}
				/>
				<div class="review-range-guide">
					<span>{difficulty ? '쉬움' : '적음'}</span><span>{difficulty ? '어려움' : '많음'}</span>
				</div>
			</div>
		{/snippet}
		{@render scoreInput('assignment', '과제 양')}
		{@render scoreInput('lecture', '강의 난이도', true)}
		{@render scoreInput('exam', '시험 횟수')}
	</div>

	<div class="review-satisfaction">
		<label for="satisfactionScore">만족도</label>
		<StarRating interactive disabled={loading} bind:score={scores.satisfaction} />
		<input
			type="hidden"
			name="satisfactionScore"
			id="satisfactionScore"
			value={scores.satisfaction}
		/>
	</div>
</section>

<style lang="scss">
	@use '$style/media';

	.review-score-section {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
		width: stretch;
	}
	.review-slider-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.6rem;
		@include media.mobile {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.review-score-item {
		display: flex;
		flex: 1 1 20rem;
		flex-direction: column;
	}
	.review-label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.2rem;
		font-weight: 600;
		font-size: 0.9rem;
	}
	.review-current-label {
		color: var(--secondary);
	}
	.review-range {
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
		border: solid 0.1rem var(--gray-border);
		border-radius: 1rem;
		corner-shape: round;
		background: var(--gray-bg);
		padding: 0.1rem;
		width: 100%;
	}
	.review-range-guide {
		display: flex;
		justify-content: space-between;
		margin-top: 0.2rem;
		color: var(--gray);
		font-size: 0.7rem;
	}
	.review-satisfaction {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
	}
	.review-satisfaction label {
		font-weight: bold;
		font-size: 1.2rem;
	}
	.review-range::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		border-radius: 1rem;
		background: var(--secondary);
		width: 1.4rem;
		height: 0.8rem;
	}
	.review-range::-moz-range-thumb {
		border: 0;
		border-radius: 1rem;
		background: var(--secondary);
		width: 1.4rem;
		height: 0.8rem;
	}
</style>
