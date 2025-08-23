<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { Course, Review } from '$lib/courseReview/type';
	import GeneralUtils from '$lib/utils/general';

	let { data } = $props();

	let course = $state<Course>(JSON.parse(data?.course || '{}'));
	let reviewArr = $state<Review[]>(JSON.parse(data?.reviewArr || '[]'));
	let errorMsg = $state<string>('');

	const user = JSON.parse(page.data.user);

	function handleEnhance() {
		return async ({
			result,
			update,
			action
		}: {
			result: ActionResult;
			update: () => Promise<void>;
			action: URL;
		}) => {
			if (result.type === 'success' && action.search === '?/createReview') {
				const newReview = JSON.parse(result.data?.review ?? '{}');
				reviewArr.push(newReview);
				course.totalScore += newReview.score;
				course.reviewCnt++;
				await update();
			} else if (result.type === 'success' && action.search === '?/deleteReview') {
				reviewArr = reviewArr.filter(
					(review: Review) => review._id.toString() !== result.data?.reviewIdRaw
				);
				course = JSON.parse(result.data?.course ?? '{}');
				await update();
			} else if (result.type === 'failure') {
				errorMsg = result.data?.message || '알 수 없는 오류가 발생했습니다.';
			} else if (result.type === 'error') {
				errorMsg = result.error?.message || '알 수 없는 오류가 발생했습니다.';
			}
		};
	}
</script>

<h1>Course Review</h1>

<div class="container-col">
	<h2>{course.title}</h2>
	<p>Content: {course.content}</p>
	<p>Professor: {course.professor}</p>
	<p>Score: {course.totalScore}</p>
	<p>Review Count: {course.reviewCnt}</p>
	<!-- {#if course.userId === user._id}
		<form method="post" action="?/deletePost">
			<input type="hidden" name="post-id" value={post._id} />
			<button type="submit">Delete</button>
		</form>
	{/if} -->
</div>

<hr />

{#each reviewArr as review (review._id)}
	<div class="container">
		<p>Score: {review.score}</p>
		<p>Comment: {review.comment}</p>
		<p>UserName: {review.userName}</p>
		<p>Date: {GeneralUtils.parseDate(review.createdAt)}</p>
		{#if review.userId === user._id}
			<form
				method="post"
				action="?/deleteReview"
				data-sveltekit-replacestate
				use:enhance={handleEnhance}
			>
				<input type="hidden" name="review-id" value={review._id} />
				<button type="submit">Delete</button>
			</form>
		{/if}
	</div>
{/each}

<hr />

<h2>리뷰 남기기</h2>
<form
	method="post"
	action="?/createReview"
	class="container"
	data-sveltekit-replacestate
	use:enhance={handleEnhance}
>
	<label for="score">Score (0~10정수)</label>
	<input type="number" name="score" />
	<label for="comment">Comment</label>
	<input type="text" name="comment" />
	<button type="submit">Submit</button>
</form>

{#if errorMsg}
	<p>{errorMsg}</p>
{/if}

<style>
	div {
		display: flex;
	}
</style>
