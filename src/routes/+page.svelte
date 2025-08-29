<script lang="ts">
	import type { Review } from '$lib/review/types.js';
	import type { Post } from '$lib/board/types.js';
	import GeneralUtils from '$lib/general/utils.js';

	let { data } = $props();
	let reviewArr = $state<Review[]>(JSON.parse(data?.reviewArr || '[]'));
	let postArr = $state<Post[]>(JSON.parse(data?.postArr || '[]'));
</script>

<div class="module" id="banner-div">
	<p>(대충 배너)</p>
</div>

<div class="module" id="calendar-div">
	<p>(대충 달력)</p>
</div>

<div class="module" id="photo-div">
	<p>(대충 사진)</p>
</div>

<div id="layout">
	<section class="module">
		<h2>공지사항</h2>
		<hr />
		<p>작성된 공지사항이 없습니다.</p>
	</section>
	<section class="module">
		<h2>청원</h2>
		<hr />
		<p>작성된 글이 없습니다.</p>
	</section>
	<section class="module">
		<h2>자유게시판</h2>
		<hr />
		{#if postArr.length === 0}
			<p>작성된 글이 없습니다.</p>
		{:else}
			{#each postArr as post (post._id)}
				<a href={`/board/${post._id}`} class="container post-div">
					<p>{post.title}</p>
					<p>{GeneralUtils.parseDate(post.createdAt, 'date')}</p>
				</a>
			{/each}
		{/if}
	</section>
	<section class="module">
		<h2>강의평가</h2>
		<hr />
		{#if reviewArr.length === 0}
			<p>작성된 리뷰가 없습니다.</p>
		{:else}
			{#each reviewArr as review (review._id)}
				<a href={`/review/${review._id}`} class="container course-div">
					<p>{review.courseName}</p>
					<p>{GeneralUtils.parseDate(review.updatedAt, 'date')}</p>
				</a>
			{/each}
		{/if}
	</section>
</div>

<style lang="scss">
	div {
		margin: 0.5rem;
	}

	#banner-div {
		width: 100%;
	}

	#calendar-div {
		width: 100%;
	}

	#photo-div {
		width: 100%;
	}

	hr {
		margin-bottom: 0.5rem;
	}

	#layout {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	section {
		display: flex;
		flex-direction: column;
	}

	.post-div {
		color: black;
		width: 100%;
		margin: 0;
		padding: 0.25rem;
		justify-content: space-between;

		&:hover {
			background-color: var(--color-gray-2);
			cursor: pointer;
			text-decoration: none;
		}
	}

	.course-div {
		color: black;
		width: 100%;
		margin: 0;
		padding: 0.25rem;
		justify-content: space-between;
		&:hover {
			background-color: var(--color-gray-2);
			cursor: pointer;
			text-decoration: none;
		}
	}
</style>
