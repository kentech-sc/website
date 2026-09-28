<script lang="ts">
	import Calendar from '@lucide/svelte/icons/calendar';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash from '@lucide/svelte/icons/trash-2';

	import type { Review, ReviewPermissions } from '$lib/types/review.type.js';

	import { resolve } from '$app/paths';
	import ArticleHeader from '$components/ArticleHeader.svelte';
	import InlineActionForm from '$components/InlineActionForm.svelte';
	import StarRating from '$components/StarRating.svelte';
	import { TERM_LABELS } from '$lib/shared/view.js';

	let { review, permissions }: { review: Review; permissions: ReviewPermissions } = $props();

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

{#snippet actions()}
	{#if permissions.canEdit}
		<a
			class="ui-button is-icon is-primary"
			aria-label="수정"
			href={resolve('/academic/reviews/[reviewId]/edit', { reviewId: review.id.toString() })}
			><Pencil size="1rem" /></a
		>
	{/if}
	{#if permissions.canDelete}
		<InlineActionForm
			actionName="deleteReview"
			buttonLabel="삭제"
			buttonClass="ui-button is-icon is-danger"
			hiddenFields={[{ name: 'review-id', value: review.id }]}
		>
			<Trash size="1rem" />
		</InlineActionForm>
	{/if}
{/snippet}

<article class="module">
	<ArticleHeader {actions}>
		{#snippet title()}[{review.courseId}] {review.courseName}{/snippet}
		{#snippet metadata()}
			<span>
				{review.professors.length
					? `${review.professors.map((professor) => professor.name).join(', ')} 교수`
					: '담당 교수 개별 배정'}
			</span>
			<span><Calendar size="0.8rem" />{review.year}년 {TERM_LABELS[review.term]}학기 수강</span>
		{/snippet}
	</ArticleHeader>
	<h3 class="container title"><span>" {review.title} "</span></h3>
	<pre>{review.comment}</pre>
	<div class="score container">
		<p>
			<span>과제 양</span>
			<span class="label-value">{getAmountLabel(review.score.assignment)}</span>
		</p>
		<p>
			<span>강의 난이도</span>
			<span class="label-value">{getDifficultyLabel(review.score.lecture)}</span>
		</p>
		<p>
			<span>시험 횟수</span>
			<span class="label-value">{getAmountLabel(review.score.exam)}</span>
		</p>
		<p>
			<span>만족도</span>
			<StarRating score={review.score.satisfaction} />
		</p>
	</div>
</article>

<style lang="scss">
	@use 'media';

	.title {
		font-weight: 600;
		& > span {
			margin: 1rem;
			box-shadow: 0 0.2rem 0.4rem var(--shadow-color);
			border-radius: 0.8rem;
			background-color: var(--warn-bg);
			padding: 0.8rem 2rem;
			width: fit-content;
			font-size: 1.2rem;
		}
	}

	pre {
		font-size: 0.9rem;
	}

	.score {
		gap: 2rem;
		margin-top: 0.8rem;

		@include media.mobile {
			flex-direction: column;
			gap: 0.4rem;
		}

		p {
			display: flex;
			gap: 0.4rem;
			font-weight: 600;
			white-space: nowrap;
		}

		.label-value {
			color: var(--secondary);
		}
	}
</style>
