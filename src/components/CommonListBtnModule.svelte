<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	import { page } from '$app/state';

	type PaginationItem = number | 'ellipsis';

	let { totalPages, currentPage }: { totalPages: number; currentPage: number } = $props();

	function createRange(start: number, end: number): number[] {
		if (end < start) return [];
		return Array.from({ length: end - start + 1 }, (_, index) => start + index);
	}

	const paginationItems = $derived.by<PaginationItem[]>(() => {
		const pages = new Set<number>([
			...createRange(1, 2),
			currentPage - 1,
			currentPage,
			currentPage + 1,
			...createRange(totalPages - 1, totalPages)
		]);

		const sortedPages = [...pages]
			.filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
			.sort((a, b) => a - b);

		const items: PaginationItem[] = [];
		let previousPage = 0;

		for (const pageNumber of sortedPages) {
			if (previousPage > 0) {
				const gap = pageNumber - previousPage;

				if (gap > 1) {
					items.push('ellipsis');
				}
			}

			items.push(pageNumber);
			previousPage = pageNumber;
		}

		return items;
	});

	function getPageHref(targetPage: number): string {
		const params = new SvelteURLSearchParams(page.url.searchParams);

		if (targetPage <= 1) {
			params.delete('page');
		} else {
			params.set('page', String(targetPage));
		}

		const query = params.toString();
		return query ? `${page.url.pathname}?${query}` : page.url.pathname;
	}
</script>

<div class="pagination container">
	{#each paginationItems as item, index (`${item}-${index}`)}
		{#if item === 'ellipsis'}
			<span class="ellipsis" aria-hidden="true">...</span>
		{:else if item === currentPage}
			<span class="btn-anchor current" aria-current="page">{item}</span>
		{:else}
			<a href={getPageHref(item)} class="btn-anchor others">{item}</a>
		{/if}
	{/each}
</div>

<style lang="scss">
	.pagination {
		margin-top: 0.5rem;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.3rem;
	}

	.current {
		border-radius: 0.5rem;
		font-weight: bold;
		border-width: 0.1rem;
		border-color: var(--black);
		background-color: var(--gray-bg);
		pointer-events: none;
	}

	.others {
		border-radius: 0.5rem;
	}

	.ellipsis {
		padding: 0 0.2rem;
		color: var(--gray-text);
	}
</style>
