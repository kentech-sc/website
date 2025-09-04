<script lang="ts">
	import type { Review } from '$lib/review/types.js';
	import type { Post } from '$lib/board/types.js';
	import GeneralUtils from '$lib/general/utils.js';
	import type { Petition } from '$lib/petition/types.js';

	let { data } = $props();
	let reviews = $state<Review[]>(JSON.parse(data?.reviews || '[]'));
	let posts = $state<Post[]>(JSON.parse(data?.posts || '[]'));
	let petitions = $state<Petition[]>(JSON.parse(data?.petitions || '[]'));
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
		<h2>공지사항<a href="/">더보기</a></h2>
		<hr />
		<p>작성된 공지사항이 없습니다.</p>
	</section>
	<section class="module">
		<h2>청원<a href="/petition">더보기</a></h2>
		<hr />
		{#if petitions.length === 0}
			<p>작성된 청원이 없습니다.</p>
		{:else}
			{#each petitions as petition (petition._id)}
				<a href={`/petition/${petition._id}`} class="container post-div">
					<p>{petition.title}</p>
					<p>{GeneralUtils.parseDate(petition.createdAt, 'date')}</p>
				</a>
			{/each}
		{/if}
	</section>
	<section class="module">
		<h2>자유게시판<a href="/board">더보기</a></h2>
		<hr />
		{#if posts.length === 0}
			<p>작성된 글이 없습니다.</p>
		{:else}
			{#each posts as post (post._id)}
				<a href={`/board/${post._id}`} class="container post-div">
					<p>{post.title}</p>
					<p>{GeneralUtils.parseDate(post.createdAt, 'date')}</p>
				</a>
			{/each}
		{/if}
	</section>
	<section class="module">
		<h2>강의평가<a href="/review">더보기</a></h2>
		<hr />
		{#if reviews.length === 0}
			<p>작성된 리뷰가 없습니다.</p>
		{:else}
			{#each reviews as review (review._id)}
				<a href={`/review/${review._id}`} class="container post-div">
					<p>{review.title}</p>
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

	h2 {
		display: flex;
		justify-content: space-between;
		align-items: center;

		a {
			font-size: 0.8rem;
		}
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

		& > a:nth-child(2n + 1) {
			background-color: var(--color-gray-2);
		}
	}

	.post-div {
		color: black;
		width: 100%;
		margin: 0;
		padding: 0.25rem;
		justify-content: space-between;

		&:hover {
			background-color: var(--color-gray-3);
			cursor: pointer;
			text-decoration: none;
		}
	}

</style>
