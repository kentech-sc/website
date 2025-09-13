<script lang="ts">
	import type { Review } from '$lib/review/types.js';
	import type { Post } from '$lib/board/types.js';
	import type { Petition } from '$lib/petition/types.js';
	import GeneralUtils from '$lib/general/utils.js';
	import PetitionService from '$lib/petition/service';

	let { data } = $props();
	let reviews = $state<Review[]>(JSON.parse(data?.reviews || '[]'));
	let posts = $state<Post[]>(JSON.parse(data?.posts || '[]'));
	let petitions = $state<Petition[]>(JSON.parse(data?.petitions || '[]'));
</script>

{#snippet GridSection(title: string, items: Review[] | Post[] | Petition[], link: string)}
	<section class="module grid-section">
		<h2>{title}<a href="/{link}">더보기</a></h2>
		<hr />
		{#if items.length === 0}
			<p>작성된 글이 없습니다.</p>
		{:else}
			{#each items as item (item._id)}
				<a href={`/${link}/${item._id}`} class="container grid-item-a">
					{#if title === '청원'}
						<span>
							<span style="color: {PetitionService.colorStatus[(item as Petition).status]}"
								>[{PetitionService.translatedStatus[(item as Petition).status]}]</span
							>
							{item.title}
						</span>
					{:else}
						<span>{item.title}</span>
					{/if}
					<span>{GeneralUtils.parseDate(item.createdAt, 'date')}</span>
				</a>
			{/each}
		{/if}
	</section>
{/snippet}

<div class="module" id="banner-div">
	<p>(대충 배너)</p>
</div>

<div class="module" id="calendar-div">
	<p>(대충 달력)</p>
</div>

<div class="module" id="photo-div">
	<p>(대충 사진)</p>
</div>

<div id="grid-div">
	{@render GridSection('공지사항', [], '')}
	{@render GridSection('청원', petitions.slice(0, 5), 'petition')}
	{@render GridSection('자유게시판', posts.slice(0, 5), 'board')}
	{@render GridSection('강의평가', reviews.slice(0, 5), 'review')}
</div>

<style lang="scss">
	#banner-div,
	#calendar-div,
	#photo-div {
		width: stretch;
		margin: 0.5rem 0;
	}

	#grid-div {
		width: stretch;
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin: 0.5rem 0;
	}

	.grid-section {
		display: flex;
		flex-direction: column;

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

		.grid-item-a {
			color: black;
			width: stretch;
			padding: 0.25rem;
			justify-content: space-between;

			&:nth-child(2n + 1) {
				background-color: var(--back-color-gray-2);
			}

			&:hover {
				background-color: var(--back-color-gray-3);
				cursor: pointer;
				text-decoration: none;
			}
		}
	}
</style>
