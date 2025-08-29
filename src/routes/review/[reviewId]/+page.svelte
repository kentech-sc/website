<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import type { Review } from '$lib/review/types.js';
	import GeneralUtils from '$lib/general/utils.js';

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
		<div class="container review-div">
			<p><strong>[{review.displayName}] ({review.score}/10)</strong></p>
			<p>"{review.comment}"</p>
			<div class="container">
				<p>{GeneralUtils.parseDate(review.createdAt)}</p>
				{#if review.userId === user._id}
					<form method="post" action="?/deleteReview" data-sveltekit-replacestate use:enhance>
						<input type="hidden" name="review-id" value={review._id} />
						<button type="submit">삭제</button>
					</form>
				{/if}
			</div>
		</div>
	</section>
</div>

<style lang="scss">
	#layout {
		width: 100%;
	}

	header {
		width: 100%;
		margin: 0.5rem;
		justify-content: space-between;
	}

	section {
		width: 100%;
		margin: 0.5rem;
	}

	.review-div {
		width: 100%;
		justify-content: space-between;

		button {
			margin-left: 0.5rem;
		}
	}
</style>
