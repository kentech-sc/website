<script lang="ts">
	import { getPlainTextFromHtml } from '$lib/shared/utils.js';
	import type { Petition } from '$lib/types/petition.type.js';
	import type { Post } from '$lib/types/post.type.js';
	import type { Review } from '$lib/types/review.type.js';

	let {
		results,
		query,
		page,
		more
	}: { results: (Post | Petition | Review)[]; query: string; page: number; more: boolean } =
		$props();

	const getSearchPageHref = (page: number): string => {
		const searchParams = new URLSearchParams({
			query,
			page: page.toString()
		});
		return `/search?${searchParams.toString()}`;
	};
</script>

{#snippet ResultItem(result: Post | Petition | Review)}
	<div class="result-item container">
		{#if 'boardId' in result}
			<a href="/board/{result.boardId}/{result._id}">
				<h3 class="ellipsis">[게시글] {result.title}</h3>
				<p class="ellipsis">{getPlainTextFromHtml(result.content)}</p>
			</a>
		{:else if 'courseId' in result}
			<a href="/review/{result._id}">
				<h3 class="ellipsis">[강의평가] {result.title}</h3>
				<p class="ellipsis">{getPlainTextFromHtml(result.comment)}</p>
			</a>
		{:else}
			<a href="/petition/{result._id}">
				<h3 class="ellipsis">[청원] {result.title}</h3>
				<p class="ellipsis">{getPlainTextFromHtml(result.content)}</p>
			</a>
		{/if}
	</div>
{/snippet}

{#snippet PaginationBtns()}
	<div class="container" id="pagination">
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
	.result-item {
		width: 100%;
		justify-content: flex-start;

		a {
			color: black;
			width: 100%;
		}
	}

	#pagination {
		margin-top: 0.5rem;
	}
</style>
