<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash from '@lucide/svelte/icons/trash-2';

	import type { Review, ReviewPermissions } from '$lib/types/review.type.js';

	import CommonArticleHeader from '$components/CommonArticleHeader.svelte';
	import InlineActionForm from '$components/InlineActionForm.svelte';
	import StarRating from '$components/StarRating.svelte';

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

{#snippet ActionGroup()}
	<div class="container">
		{#if permissions.canEdit}
			<a class="edit-btn inline-container" href="{review._id}/edit"><Pencil size="1.2rem" /></a>
		{/if}
		{#if permissions.canDelete}
			<div class="delete-form">
				<InlineActionForm
					actionName="deleteReview"
					buttonClass="inline-container"
					hiddenFields={[{ name: 'review-id', value: review._id }]}
				>
					<Trash size="1.2rem" />
				</InlineActionForm>
			</div>
		{/if}
	</div>
{/snippet}

<article class="module">
	<CommonArticleHeader type="review" item={review}>
		{@render ActionGroup()}
	</CommonArticleHeader>
	<hr />
	<h2 class="container title"><span>" {review.title} "</span></h2>
	<pre>{review.comment}</pre>
	<hr />
	<div class="score container">
		<p>
			<b>과제 양</b>
			<span class="label-value">{getAmountLabel(review.score.assignment)}</span>
		</p>
		<p>
			<b>강의 난이도</b>
			<span class="label-value">{getDifficultyLabel(review.score.lecture)}</span>
		</p>
		<p>
			<b>시험 횟수</b>
			<span class="label-value">{getAmountLabel(review.score.exam)}</span>
		</p>
		<p>
			<b>만족도</b>
			<StarRating score={review.score.satisfaction} />
		</p>
	</div>
</article>

<style lang="scss">
	@use 'media';

	article {
		width: 100%;
	}

	.title {
		font-weight: 600;
		& > span {
			margin: 1rem;
			box-shadow: 0 0.2rem 0.4rem var(--shadow-color);
			border-radius: 0.8rem;
			background-color: var(--warn-bg);
			padding: 0.8rem 2rem;
			width: fit-content;
		}
	}

	.score {
		gap: 2rem;
		margin-top: 0.8rem;

		@include media.mobile {
			gap: .4rem;
			flex-direction: column;
		}

		p {
			display: flex;
			gap: 0.4rem;
			white-space: nowrap;
		}

		.label-value {
			color: var(--secondary);
			font-weight: bold;
		}
	}

	.edit-btn {
		border-radius: 0.4rem;
		padding: 0.2rem 0.4rem;
		color: var(--secondary);

		&:hover {
			background-color: var(--gray-hover);
		}
	}

	.delete-form :global(button) {
		border: none;
		padding: 0.2rem 0.4rem;
		color: var(--error);
	}
</style>
