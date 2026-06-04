<script lang="ts">
	import MobileListItem from '$components/MobileListItem.svelte';

	import type { Review } from '$lib/types/review.type.js';

	import { parseDate, parseRelativeDate } from '$lib/shared/utils.js';
	import { translatedTerm } from '$lib/shared/view.js';

	let { reviews }: { reviews: Review[] } = $props();
</script>

{#snippet Item(review: Review)}
	<tr>
		<td><a href={`/review/${review._id}`}>"{review.title}"</a></td>
		<td>{review.professorName}</td>
		<td>{review.year}학년도 {translatedTerm[review.term]}학기</td>
		<td>{parseDate(review.createdAt, 'date')}</td>
	</tr>
{/snippet}

<table>
	<colgroup>
		<col style="width:55%" />
		<col style="width:15%" />
		<col style="width:15%" />
		<col style="width:15%" />
	</colgroup>
	<thead>
		<tr>
			<th>한줄평</th>
			<th>교수님</th>
			<th>수강 학기</th>
			<th>작성일</th>
		</tr>
	</thead>
	<tbody>
		{#if reviews.length === 0}
			<tr>
				<td colspan="4">작성된 평가가 없습니다.</td>
			</tr>
		{:else}
			{#each reviews as review (review._id)}
				{@render Item(review)}
			{/each}
		{/if}
	</tbody>
</table>

<div class="mobile-list">
	{#if reviews.length === 0}
		<p class="empty">작성된 평가가 없습니다.</p>
	{:else}
		{#each reviews as review (review._id)}
			<MobileListItem href={`/review/${review._id}`}>
				{#snippet row1()}
					<span class="title">"{review.title}"</span>
				{/snippet}
				{#snippet row2()}
					<span class="meta">{review.professorName} · {review.year}학년도 {translatedTerm[review.term]}학기</span>
					<span class="time">{parseRelativeDate(review.createdAt)}</span>
				{/snippet}
			</MobileListItem>
		{/each}
	{/if}
</div>

<style lang="scss">
	table {
		width: 100%;

		th {
			word-break: keep-all;
		}

		td,
		th {
			padding: 0.5rem;
			background-color: white;
			border: none;
		}

		thead > tr > th {
			border-bottom: solid var(--gray-border) 0.1rem;
		}

		tbody {
			tr {
				border-bottom: solid var(--gray-border) 0.1rem;
			}

			tr:hover > td {
				background-color: var(--gray-bg);
			}
		}

		td:nth-child(n) {
			text-align: center;
		}

		td:first-child {
			text-align: left;
			font-weight: bold;

			a {
				color: black;
			}
		}
	}

	.mobile-list {
		display: none;
	}

	@media (max-width: 768px) {
		table {
			display: none;
		}

		.mobile-list {
			display: flex;
			flex-direction: column;
			width: 100%;

			.empty {
				padding: 1rem;
				color: var(--gray-text);
			}
		}
	}
</style>
