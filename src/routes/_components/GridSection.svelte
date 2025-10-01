<script lang="ts">
	import GeneralUtils from '$lib/general/utils.js';
	import PetitionService from '$lib/petition/service';
	import type { Review } from '$lib/review/types.js';
	import type { Post } from '$lib/board/types.js';
	import type { Petition } from '$lib/petition/types.js';

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
				<span class={(item as Petition).status}
					>[{PetitionService.translatedStatus[(item as Petition).status]}]</span
				>
			{/if}
			{item.title}
		</span>
		<span>{GeneralUtils.parseDate(item.createdAt, 'date')}</span>
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
		margin: 0.5rem;
	}

	h2 {
		display: flex;
		justify-content: space-between;
		align-items: center;

		a {
			font-size: 0.8rem;
		}
	}

	.grid-item {
		color: black;
		width: stretch;
		padding: 0.25rem;
		justify-content: space-between;

		&:nth-child(2n + 1) {
			background-color: var(--gray-bg);
		}

		&:hover {
			background-color: var(--gray-hover);
			cursor: pointer;
			text-decoration: none;
		}

		.ongoing {
			color: blue;
		}
		.pending {
			color: orange;
		}
		.reviewing {
			color: red;
		}
		.answered {
			color: green;
		}
		.expired {
			color: gray;
		}
	}
</style>
