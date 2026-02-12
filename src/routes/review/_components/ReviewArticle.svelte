<script lang="ts">
	import * as ReviewService from '$lib/srv/review.srv.js';
	import * as CommonUtils from '$lib/common/utils.js';

	import CommonForm from '$components/CommonForm.svelte';
	import StarRating from '$components/common/StarRating.svelte';

	import Clock from '@lucide/svelte/icons/clock';
    import Calendar from '@lucide/svelte/icons/calendar';

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
	<p class="time-info">
		<span>
            <Calendar size="1rem" color="var(--gray-text)" />
            {review.year}년 {ReviewService.translatedTerm[review.term]}학기 수강
        </span>
        <span>
            <Clock size="1rem" color="var(--gray-text)" />
            {CommonUtils.parseDate(review.createdAt)}
        </span>
	</p>
{/snippet}

{#snippet ReviewHeader()}
	<header class="container">
		<div class="container-col header-content">
            <p class="sub-text">
                [{review.courseCode}] {review.courseName} | {review.professorName} 교수님
            </p>
            {@render ReviewerInfo()}
        </div>

		<div>
			{#if review.userId === user._id}
				{@render BtnGroup()}
			{/if}
		</div>
	</header>
{/snippet}

{#snippet ReviewContents()}
	<h2>"{review.title}"</h2>
	<hr />
	<pre>{review.comment}</pre>
	<hr />
	<div class="container" id="score">
		<p><b>과제 양:</b> <StarRating score={review.score.assignment}/></p>
		<p><b>강의 난이도:</b> <StarRating score={review.score.lecture}/></p>
		<p><b>시험 횟수:</b> <StarRating score={review.score.exam}/></p>
	</div>
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

	.time-info {
		display: flex;
		align-items: center;
		gap: 1rem;
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
		gap: 3em;
		flex-wrap: wrap;

		margin-top: 1rem;

		p {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			margin: 0;
			white-space: nowrap;
		}
	}
</style>
