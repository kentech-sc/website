<script lang="ts">
	import type { Petition } from '$lib/types/petition.type.js';
	import type { Post } from '$lib/types/post.type.js';
	import type { Review } from '$lib/types/review.type.js';

	import { parseDate } from '$lib/shared/utils.js';
	import { translatedStatus, colorStatus } from '$lib/shared/view.js';

	let {
		title,
		items,
		link
	}: { title: string; items: Review[] | Post[] | Petition[]; link: string } = $props();
</script>

{#snippet Header()}
	<h2>{title}<a href="/{link}">더보기</a></h2>
{/snippet}

{#snippet Item(item: Review | Post | Petition)}
	<a href="/{link}/{item._id}" class="container grid-item">
		<span>
			{#if title === '청원'}
				<span class={(item as Petition).status} style:color={colorStatus[(item as Petition).status]}
					>[{translatedStatus[(item as Petition).status]}]</span
				>
			{/if}
			{item.title}
		</span>
		<span>{parseDate(item.createdAt, 'date')}</span>
	</a>
{/snippet}

<section class="module">
	{@render Header()}
	<hr />
	{#if items.length === 0}
		<p>작성된 글이 없습니다.</p>
	{:else}
		{#each items as item (item._id)}{@render Item(item)}{/each}
	{/if}
</section>

<style lang="scss">
	section {
		margin: 0.4rem;
		width: auto;
	}

	h2 {
		display: flex;
		justify-content: space-between;
		align-items: center;

		a {
			font-size: 0.7rem;
		}
	}

	.grid-item {
		color: black;
		padding: 0.25rem;
		justify-content: space-between;

		span:first-child {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		span:last-child {
			white-space: nowrap;
		}

		&:nth-child(2n + 1) {
			background-color: var(--gray-bg);
		}

		&:hover {
			background-color: var(--gray-hover);
			cursor: pointer;
			text-decoration: none;
		}
	}
</style>
