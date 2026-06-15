<script lang="ts">
	import type { Page, SearchEntity } from '$lib/types/general.type.js';
	import type { PetitionEntity } from '$lib/types/petition.type.js';
	import type { PostEntity } from '$lib/types/post.type.js';
	import type { ReviewEntity } from '$lib/types/review.type.js';

	import CommonListPaginationBtn from '$components/CommonListPaginationBtn.svelte';
	import { getPlainTextFromHtml } from '$lib/shared/utils.js';

	let {
		searchPage
	}: {
		searchPage: Page<SearchEntity>;
	} = $props();
</script>

{#snippet ListItem(item: PostEntity | PetitionEntity | ReviewEntity)}
	{#if 'boardId' in item}
		<a class="list-item" href="/board/{item.boardId}/{item._id}">
			<h3 class="ellipsis"><span class="board-tag">게시글</span>{item.title}</h3>
			<p class="ellipsis">{getPlainTextFromHtml(item.content)}</p>
		</a>
	{:else if 'courseId' in item}
		<a class="list-item" href="/review/{item._id}">
			<h3 class="ellipsis"><span class="review-tag">강의평가</span> {item.title}</h3>
			<p class="ellipsis">{getPlainTextFromHtml(item.comment)}</p>
		</a>
	{:else}
		<a class="list-item" href="/petition/{item._id}">
			<h3 class="ellipsis"><span class="petition-tag">청원</span> {item.title}</h3>
			<p class="ellipsis">{getPlainTextFromHtml(item.content)}</p>
		</a>
	{/if}
{/snippet}

<section class="module container-col">
	{#if searchPage.items.length === 0}
		<p>검색 결과가 없습니다.</p>
	{:else}
		{#each searchPage.items as item (item._id)}
			{@render ListItem(item)}
		{/each}

		<CommonListPaginationBtn
			currentPage={searchPage.currentPage}
			totalPages={searchPage.totalPages}
		/>
	{/if}
</section>

<style lang="scss">
	section {
		margin-top: 1rem;
		padding: 0;
		overflow: hidden;

		& > p {
			padding: 0.8rem 1rem;
			width: 100%;
		}
	}

	.list-item {
		justify-content: flex-start;
		border-bottom: solid 0.1rem var(--gray-border);
		padding: 0.8rem 0.8rem;
		width: 100%;
		color: var(--black);
		text-decoration: none;

		&:hover {
			background-color: var(--gray-bg);
		}

		h3 {
			margin-bottom: 0.4rem;
			font-weight: 600;
			font-size: 1rem;
		}

		span {
			margin-right: 0.4rem;
			border-radius: 0.4rem;
			padding: 0.2rem 0.4rem;
		}

		.board-tag {
			background-color: var(--success-bg);
		}

		.petition-tag {
			background-color: var(--info-bg);
		}

		.review-tag {
			background-color: var(--warn-bg);
		}

		p {
			padding: 0 0.2rem;
			font-size: 0.8rem;
		}
	}
</style>
