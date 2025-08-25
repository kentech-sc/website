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

<div id="layout" class="container-col">
	<header class="container module">
		<h1>강의 평가</h1>
		<a href="/review">목록</a>
	</header>

	<section class="container-col module">
		<h2>{course.title}</h2>
		<p>강의 내용: {course.content}</p>
		<p>교수님: {course.professor}</p>
		<p>리뷰 수: {course.reviewCnt}</p>
		<p>평균 점수: {Math.round((course.totalScore / course.reviewCnt) * 100) / 100}/10</p>
		<!-- {#if course.userId === user._id}
		<form method="post" action="?/deletePost">
			<input type="hidden" name="post-id" value={post._id} />
			<button type="submit">Delete</button>
		</form>
	{/if} -->
	</section>

	<section class="container-col module">
		{#if reviewArr.length === 0}
			<p>작성된 리뷰가 없습니다.</p>
		{:else}
			{#each reviewArr as review (review._id)}
				<div class="container review-div">
					<p><strong>[{review.userName}] ({review.score}/10)</strong></p>
					<p>{review.comment}</p>
					<div class="container">
						<p>{GeneralUtils.parseDate(review.createdAt)}</p>
						{#if review.userId === user._id}
							<form
								method="post"
								action="?/deleteReview"
								data-sveltekit-replacestate
								use:enhance={handleEnhance}
							>
								<input type="hidden" name="review-id" value={review._id} />
								<button type="submit">삭제</button>
							</form>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	</section>

	<section class="container-col module" id="new-review-section">
		<h2>리뷰 남기기</h2>
		<form
			method="post"
			action="?/createReview"
			class="container"
			data-sveltekit-replacestate
			use:enhance={handleEnhance}
		>
			<label for="score">점수 (0~10정수):&nbsp;</label>
			<input type="number" id="score" name="score" />
			<label for="comment">한줄평:&nbsp;</label>
			<input type="text" id="comment" name="comment" />
			<button type="submit">작성</button>
		</form>

		{#if errorMsg}
			<p>{errorMsg}</p>
		{/if}
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

	#new-review-section form {
		width: 100%;
		word-break: keep-all;
		white-space: nowrap;
		input {
			margin-right: 1rem;
		}

		input:nth-child(2) {
			width: 10%;
		}

		input:nth-child(4) {
			width: stretch;
		}
	}
</style>
