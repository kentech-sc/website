<script lang="ts">
	import { page } from '$app/state';
	import type { Review } from '$lib/review/types.js';
	import GeneralUtils from '$lib/general/utils.js';
	import ReviewService from '$lib/review/service';
	import CommonForm from '$lib/assets/commonForm.svelte';

	const user = JSON.parse(page.data.user);

	let { data } = $props();

	let review = $state<Review>(JSON.parse(data?.review || '{}'));
</script>

{#snippet HeaderModule()}
	<header class="container module">
		<h1>강의 평가</h1>
		<a href="/review">목록</a>
	</header>
{/snippet}

{#snippet CourseSection()}
	<section class="container-col module">
		<p><strong>[{review.courseCode}] {review.courseName}</strong></p>
		<p>{review.professorName} 교수님</p>
	</section>
{/snippet}

{#snippet ReviewHeader()}
	<header class="container">
		<div class="container-col">
			<h2>{review.title}</h2>
			<p>
				{review.year}학년도 {ReviewService.translatedTerm[review.term]}학기 수강생 | {GeneralUtils.parseDate(
					review.createdAt
				)}
			</p>
		</div>
		{#if review.userId === user._id}
			<div class="delete-form">
				<CommonForm actionName="deleteReview" formName="deleteReview">
					<input type="hidden" name="review-id" value={review._id} />
					<button type="submit">삭제</button>
				</CommonForm>
			</div>
		{/if}
	</header>
{/snippet}

{#snippet ReviewContents()}
	<p><b>과제:</b> {review.score.assignment}</p>
	<hr />
	<p><b>강의:</b> {review.score.lecture}</p>
	<hr />
	<p><b>시험:</b> {review.score.exam}</p>
	<hr />
	<pre>{review.comment}</pre>
{/snippet}

{#snippet ReviewSection()}
	<section class="container-col module">
		<article>
			{@render ReviewHeader()}
			<hr />
			{@render ReviewContents()}
		</article>
	</section>
{/snippet}

{@render HeaderModule()}
{@render CourseSection()}
{@render ReviewSection()}

<style lang="scss">
	header {
		width: stretch;
		margin: 0.5rem;
		justify-content: space-between;
	}

	article {
		width: stretch;

		header {
			& > div {
				align-items: flex-start;
			}
		}

		pre {
			margin: 0.5rem;
		}
	}

	.delete-form {
		width: fit-content;
	}

	section {
		width: stretch;
		margin: 0.5rem;
	}
</style>
