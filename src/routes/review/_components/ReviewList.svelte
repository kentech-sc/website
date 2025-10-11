<script lang="ts">
	import type { Review } from '$lib/review/types.js';

	import ReviewService from '$lib/review/service';
	import GeneralUtils from '$lib/general/utils';

	let { reviews } = $props();
</script>

{#snippet Item(review: Review)}
	<tr>
		<td><a href={`/review/${review._id}`}>"{review.title}"</a></td>
		<td>{review.professorName}</td>
		<td>{review.year}학년도 {ReviewService.translatedTerm[review.term]}학기</td>
		<td>{GeneralUtils.parseDate(review.createdAt, 'date')}</td>
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
			<th>작성자</th>
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

<style lang="scss">
	table {
		width: stretch;

		td,
		th {
			padding: 0.5rem;
			background-color: white;
			border: none;
		}

		thead > tr > th {
			border-bottom: solid var(--gray-border) 0.1rem;
		}

		tbody > tr:nth-child(2n + 1) > td {
			background-color: var(--gray-bg);
		}

		td:nth-child(n) {
			text-align: center;
		}

		td:first-child {
			text-align: left;
		}

		td:first-child {
			font-weight: bold;
			a {
				color: black;
			}
		}
	}
</style>
