<script lang="ts">
	import * as ReviewService from '$lib/srv/review.srv.js';
	import * as CommonUtils from '$lib/common/utils.js';

	import CommonForm from '$components/CommonForm.svelte';

	let { review, user } = $props();
</script>

{#snippet BtnGroup()}
	<div class="container" id="btn-group">
		<a href="{review._id}/edit" class="btn-anchor">수정</a>
		<div class="delete-form">
			<CommonForm actionName="deleteReview" formName="deleteReview">
				<input type="hidden" name="review-id" value={review._id} />
				<button type="submit">삭제</button>
			</CommonForm>
		</div>
	</div>
{/snippet}

{#snippet ReviewerInfo()}
	<p>
		{review.year}학년도 {ReviewService.translatedTerm[review.term]}학기 수강생 | {CommonUtils.parseDate(
			review.createdAt
		)}
	</p>
{/snippet}

{#snippet ReviewHeader()}
	<header class="container">
		<div>
			<p><strong>[{review.courseCode}] {review.courseName}</strong></p>
			<p>{review.professorName} 교수님</p>
		</div>

		<div>
			{#if review.userId === user._id}
				{@render BtnGroup()}
			{/if}
			{@render ReviewerInfo()}
		</div>
	</header>
{/snippet}

{#snippet ReviewContents()}
	<h2>"{review.title}"</h2>
	<hr />
	<p><b>과제 양:</b> {review.score.assignment}</p>
	<hr />
	<p><b>강의 난이도:</b> {review.score.lecture}</p>
	<hr />
	<p><b>시험 횟수:</b> {review.score.exam}</p>
	<hr />
	<pre>{review.comment}</pre>
{/snippet}

<article class="module">
	{@render ReviewHeader()}
	<hr />
	{@render ReviewContents()}
</article>

<style lang="scss">
	header {
		justify-content: space-between;

		#btn-group {
			justify-content: flex-end;
		}
	}

	article {
		width: stretch;

		header {
			& > div {
				align-items: flex-start;
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
</style>
