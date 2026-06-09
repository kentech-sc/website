<script lang="ts">
	import Calendar from '@lucide/svelte/icons/calendar';
	import Clock from '@lucide/svelte/icons/clock';

	import CommonForm from '$components/CommonForm.svelte';
	import StarRating from '$components/StarRating.svelte';

	import type { Review, ReviewPermissions } from '$lib/types/review.type.js';

	import { parseDate } from '$lib/shared/utils.js';
	import { translatedTerm } from '$lib/shared/view.js';

	let { review, permissions }: { review: Review; permissions: ReviewPermissions } = $props();

	function getAmountLabel(value: number): string {
		if (value <= 1) return '아주 적음';
		if (value <= 2) return '적음';
		if (value <= 3) return '보통';
		if (value <= 4) return '많음';
		return '아주 많음';
	}

	function getDifficultyLabel(value: number): string {
		if (value <= 1) return '매우 쉬움';
		if (value <= 2) return '쉬움';
		if (value <= 3) return '보통';
		if (value <= 4) return '어려움';
		return '매우 어려움';
	}
</script>

<article class="module">
	<header class="container">
		<div class="container-col header-content">
			<p class="sub-text">
				[{review.courseId}] {review.courseName} | {review.professorName} 교수님
			</p>
			<p class="time-info">
				<span>
					<Calendar size="1rem" color="var(--gray-text)" />
					{review.year}년 {translatedTerm[review.term]}학기 수강
				</span>
				<span>
					<Clock size="1rem" color="var(--gray-text)" />
					{parseDate(review.createdAt)}
				</span>
			</p>
		</div>

		{#if permissions.canEdit || permissions.canDelete}
			<div id="btn-group" class="container">
				{#if permissions.canEdit}
					<a href="{review._id}/edit" class="btn-anchor">수정</a>
				{/if}
				{#if permissions.canDelete}
					<div class="delete-form">
						<CommonForm actionName="deleteReview" formName="deleteReview">
							<input type="hidden" name="review-id" value={review._id} />
							<button type="submit">삭제</button>
						</CommonForm>
					</div>
				{/if}
			</div>
		{/if}
	</header>
	<hr />

	<h2>"{review.title}"</h2>
	<hr />
	<pre>{review.comment}</pre>
	<hr />
	<div id="score">
		<div class="container score-labels">
			<p>
				<b>과제 양:</b> <span class="label-value">{getAmountLabel(review.score.assignment)}</span>
			</p>
			<p>
				<b>강의 난이도:</b>
				<span class="label-value">{getDifficultyLabel(review.score.lecture)}</span>
			</p>
			<p><b>시험 횟수:</b> <span class="label-value">{getAmountLabel(review.score.exam)}</span></p>
		</div>
		<div class="container score-satisfaction">
			<p><b>만족도:</b> <StarRating score={review.score.satisfaction} /></p>
		</div>
	</div>
</article>

<style lang="scss">
	header {
		justify-content: space-between;

		#btn-group {
			justify-content: flex-end;
		}
	}

	article {
		width: 100%;

		header {
			& > div {
				align-items: flex-start;
			}

			.header-content {
				min-width: 0;
				word-break: break-word;
			}

			@media (max-width: 768px) {
				flex-direction: column;
				align-items: flex-start;
				gap: 0.5rem;
			}
		}

		h2 {
			margin: 1.5rem 0;
			text-align: center;
		}
	}

	.delete-form {
		width: fit-content;
	}

	.time-info {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		color: var(--gray-text);
		font-size: 0.8rem;
		margin: 0;

		span {
			display: flex;
			align-items: center;
			gap: 0.3rem;
		}
	}

	#score {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;

		.score-labels {
			gap: 2.5rem;
			flex-wrap: wrap;
		}

		.score-satisfaction {
			gap: 0.5rem;
		}

		p {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			margin: 0;
			white-space: nowrap;
		}

		.label-value {
			color: var(--secondary);
			font-weight: bold;
		}
	}
</style>
