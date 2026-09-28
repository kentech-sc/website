<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import X from '@lucide/svelte/icons/x';

	import ReviewOfferingPicker from './ReviewOfferingPicker.svelte';
	import ReviewScores from './ReviewScores.svelte';

	import type { ReviewableOffering } from '$lib/types/academic.type.js';
	import type { Review } from '$lib/types/review.type.js';

	import { resolve } from '$app/paths';
	import ActionForm from '$components/ActionForm.svelte';
	import FormField from '$components/FormField.svelte';
	import { TERM_LABELS } from '$lib/shared/view.js';

	let {
		reviewableOfferings = [],
		review
	}: {
		reviewableOfferings?: ReviewableOffering[];
		review?: Review;
	} = $props();

	let initializedFor = $state<string | null>(null);
	let loading = $state(false);
	let scores = $state({ assignment: 3, lecture: 3, exam: 3, satisfaction: 10 });

	$effect(() => {
		const formKey = review?.id ?? 'new';
		if (initializedFor === formKey) return;
		initializedFor = formKey;
		scores = {
			assignment: review?.score.assignment ?? 3,
			lecture: review?.score.lecture ?? 3,
			exam: review?.score.exam ?? 3,
			satisfaction: review?.score.satisfaction ?? 10
		};
	});
</script>

<section class="module">
	<ActionForm
		actionName={review ? 'editReview' : 'createReview'}
		formName={review ? 'editReview' : 'createReview'}
		bind:loading
	>
		<div class="review-form container-col">
			<section class="input-section container-col">
				{#if review}
					<p class="fixed-offering">
						<strong>[{review.courseId}] {review.courseName}</strong>
						<span>
							{review.year}년 {TERM_LABELS[review.term]}학기 · {review.professors
								.map((professor) => professor.name)
								.join(', ') || '담당 교수 개별 배정'}
						</span>
					</p>
				{:else}
					<ReviewOfferingPicker {reviewableOfferings} />
				{/if}

				<FormField inputId="title" label="제목">
					<input type="text" id="title" name="title" value={review?.title} maxlength="100" />
				</FormField>

				<FormField inputId="comment" label="내용">
					<textarea id="comment" name="comment" class="review-comment">{review?.comment}</textarea>
				</FormField>
			</section>

			<ReviewScores bind:scores {loading} />

			<div class="form-actions-end">
				{#if review}
					<a
						class="ui-button is-secondary"
						href={resolve('/academic/reviews/[reviewId]', { reviewId: review.id })}
					>
						<X size="0.8rem" />취소
					</a>
				{/if}
				<button type="submit" class="ui-button is-primary"
					><Pencil size="0.8rem" />{review ? '수정' : '작성'}</button
				>
			</div>
		</div>
	</ActionForm>
</section>

<style lang="scss">
	section {
		gap: 0.8rem;
	}
	textarea {
		resize: vertical;
	}
	.review-form {
		gap: 1.2rem;
		& > * {
			width: stretch;
		}
	}
	.input-section {
		gap: 0.6rem;
	}
	.fixed-offering {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		margin: 0;
		border-radius: 1.4rem;
		background: var(--gray-bg);
		padding: 0.7rem;
		width: stretch;
	}
	.review-comment {
		min-height: 8rem;
	}
	.form-actions-end {
		display: flex;
		justify-content: right;
		gap: 0.4rem;
	}
</style>
