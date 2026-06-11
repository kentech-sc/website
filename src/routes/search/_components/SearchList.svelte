<script lang="ts">
	import type { PetitionEntity } from '$lib/types/petition.type.js';
	import type { PostEntity } from '$lib/types/post.type.js';
	import type { ReviewEntity } from '$lib/types/review.type.js';

	import { getPlainTextFromHtml } from '$lib/shared/utils.js';

	let {
		results,
		query,
		page,
		more
	}: {
		results: (PostEntity | PetitionEntity | ReviewEntity)[];
		query: string;
		page: number;
		more: boolean;
	} = $props();

	const getSearchPageHref = (page: number): string => {
		const searchParams = new URLSearchParams({
			query,
			page: page.toString()
		});
		return `/search?${searchParams.toString()}`;
	};
</script>

{#snippet ResultItem(result: PostEntity | PetitionEntity | ReviewEntity)}
	<div class="search-result container">
		{#if 'boardId' in result}
			<a class="search-result-link" href="/board/{result.boardId}/{result._id}">
				<h3 class="ellipsis">[게시글] {result.title}</h3>
				<p class="ellipsis">{getPlainTextFromHtml(result.content)}</p>
			</a>
		{:else if 'courseId' in result}
			<a class="search-result-link" href="/review/{result._id}">
				<h3 class="ellipsis">[강의평] {result.title}</h3>
				<p class="ellipsis">{getPlainTextFromHtml(result.comment)}</p>
			</a>
		{:else}
			<a class="search-result-link" href="/petition/{result._id}">
				<h3 class="ellipsis">[청원] {result.title}</h3>
				<p class="ellipsis">{getPlainTextFromHtml(result.content)}</p>
			</a>
		{/if}
	</div>
{/snippet}

{#snippet PaginationBtns()}
	<div class="container search-pagination">
		{#if page > 1}
			<a href={getSearchPageHref(page - 1)} class="btn-anchor">이전</a>
		{:else}
			<span class="btn-anchor-disabled">이전</span>
		{/if}
		{#if more}
			<a href={getSearchPageHref(page + 1)} class="btn-anchor">다음</a>
		{:else}
			<span class="btn-anchor-disabled">다음</span>
		{/if}
	</div>
{/snippet}

<section class="container-col module">
	{#if results.length === 0}
		<p>검색 결과가 없습니다.</p>
	{:else}
		{#each results as result (result._id)}
			{@render ResultItem(result)}
			<hr />
		{/each}
	{/if}
	{@render PaginationBtns()}
</section>

<style lang="scss">
	.search-result {
		width: 100%;
		justify-content: flex-start;
	}

	.search-result-link {
		width: 100%;
		color: var(--text);
	}

	.search-pagination {
		margin-top: 0.6rem;
	}
</style>
