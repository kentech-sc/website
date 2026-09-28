<script lang="ts" generics="T extends { id: string | number }">
	import type { Page } from '$lib/types/general.type.js';
	import type { Snippet } from 'svelte';

	import Pagination from '$components/Pagination.svelte';

	let {
		page,
		emptyMessage,
		item
	}: {
		page: Page<T>;
		emptyMessage: string;
		item: Snippet<[T]>;
	} = $props();
</script>

<section class="module is-flush content-list">
	{#if page.items.length === 0}
		<p>{emptyMessage}</p>
	{:else}
		<ul>
			{#each page.items as value (value.id)}
				<li>{@render item(value)}</li>
			{/each}
		</ul>
		<footer><Pagination currentPage={page.currentPage} totalPages={page.totalPages} /></footer>
	{/if}
</section>
