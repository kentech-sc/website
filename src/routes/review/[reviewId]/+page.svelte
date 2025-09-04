<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import type { Review } from '$lib/review/types.js';
	import GeneralUtils from '$lib/general/utils.js';
	import ReviewService from '$lib/review/service';

	let { data } = $props();

	let review = $state<Review>(JSON.parse(data?.review || '{}'));

	const user = JSON.parse(page.data.user);
</script>

<div id="layout" class="container-col">
	<header class="container module">
		<h1>강의 평가</h1>
		<a href="/review">목록</a>
	</header>

	<section class="container-col module">
		<p><strong>[{review.courseCode}] {review.courseName}</strong></p>
		<p>{review.professorName} 교수님</p>
	</section>

	<section class="container-col module">
		<article>
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
					<form method="post" action="?/deleteReview" data-sveltekit-replacestate use:enhance>
						<input type="hidden" name="review-id" value={review._id} />
						<button type="submit">삭제</button>
					</form>
				{/if}
			</header>
			<hr />
			<p><b>과제:</b> {review.score.assignment}</p>
			<hr />
			<p><b>강의:</b> {review.score.lecture}</p>
			<hr />
			<p><b>시험:</b> {review.score.exam}</p>
			<hr />
			<pre>{review.comment}</pre>
		</article>
	</section>
</div>

<style lang="scss">
	#layout {
		width: 100%;

		& > header {
			width: 100%;
			margin: 0.5rem;
			justify-content: space-between;
		}
	}

	article {
		width: stretch;

		header {
			margin: 0.5rem;
			justify-content: space-between;

			& > div {
				align-items: flex-start;
			}
		}

		pre {
			margin: 0.5rem;
		}
	}

	section {
		width: 100%;
		margin: 0.5rem;
	}
</style>
