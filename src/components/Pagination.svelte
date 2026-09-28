<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	import type { PaginationItem } from '$lib/types/general.type.js';

	import { page } from '$app/state';
	import { resolveInternalPath } from '$lib/shared/paths.js';

	let { totalPages, currentPage }: { totalPages: number; currentPage: number } = $props();

	const createRange = (start: number, end: number): number[] => {
		if (end < start) return [];
		return Array.from({ length: end - start + 1 }, (_, index) => start + index);
	};

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
			if (previousPage > 0 && pageNumber - previousPage > 1) items.push('ellipsis');
			items.push(pageNumber);
			previousPage = pageNumber;
		}
		return items;
	});

	const pageHref = (targetPage: number): string => {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		if (targetPage <= 1) params.delete('page');
		else params.set('page', String(targetPage));
		const query = params.toString();
		return query ? `${page.url.pathname}?${query}` : page.url.pathname;
	};
</script>

<nav class="pagination" aria-label="페이지 이동">
	{#each paginationItems as item, index (`${item}-${index}`)}
		{#if item === 'ellipsis'}
			<span class="ellipsis" aria-hidden="true">…</span>
		{:else if item === currentPage}
			<span class="current" aria-current="page">{item}</span>
		{:else}
			<a href={resolveInternalPath(pageHref(item))}>{item}</a>
		{/if}
	{/each}
</nav>

<style lang="scss">
	.pagination {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		margin: 1rem 0;
		border: solid var(--divider-border-width) var(--gray-border);
		border-radius: 1.4rem;
		width: fit-content;
		overflow: hidden;
	}

	.pagination > :global(*) {
		padding: 0.2rem 0.8rem;
		font-size: 0.7rem;
		text-decoration: none;
	}

	.pagination > :global(*:not(:last-child)) {
		border-right: solid var(--divider-border-width) var(--gray-border);
	}

	.pagination a {
		color: var(--text);
	}

	.pagination a:hover,
	.current {
		background-color: var(--gray-hover);
	}

	.current {
		font-weight: 700;
	}

	.ellipsis {
		color: var(--gray-text);
	}
</style>
