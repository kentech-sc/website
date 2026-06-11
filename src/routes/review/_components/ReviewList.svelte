<script lang="ts">
	import type { Review } from '$lib/types/review.type.js';

	import MobileListItem from '$components/MobileListItem.svelte';
	import { parseDate, parseRelativeDate } from '$lib/shared/utils.js';
	import { translatedTerm } from '$lib/shared/view.js';

	let { reviews }: { reviews: Review[] } = $props();
</script>

{#snippet Item(review: Review)}
	<tr>
		<td><a href={`/review/${review._id}`}>"{review.title}"</a></td>
		<td>{review.professorName}</td>
		<td>{review.year}년 {translatedTerm[review.term]}학기</td>
		<td>{parseDate(review.createdAt, 'date')}</td>
	</tr>
{/snippet}

<div class="desktop-list-shell">
	<table class="data-table">
		<colgroup>
			<col style="width:55%" />
			<col style="width:15%" />
			<col style="width:15%" />
			<col style="width:15%" />
		</colgroup>
		<thead>
			<tr>
				<th>제목</th>
				<th>교수명</th>
				<th>수강 학기</th>
				<th>작성일</th>
			</tr>
		</thead>
		<tbody>
			{#if reviews.length === 0}
				<tr class="review-empty-row">
					<td colspan="4">작성된 강의평이 없습니다.</td>
				</tr>
			{:else}
				{#each reviews as review (review._id)}
					{@render Item(review)}
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<div class="mobile-list-shell">
	{#if reviews.length === 0}
		<p class="empty">작성된 강의평이 없습니다.</p>
	{:else}
		{#each reviews as review (review._id)}
			<MobileListItem href={`/review/${review._id}`}>
				{#snippet row1()}
					<span class="title">"{review.title}"</span>
				{/snippet}
				{#snippet row2()}
					<span class="meta"
						>{review.professorName} | {review.year}년 {translatedTerm[review.term]}학기</span
					>
					<span class="time">{parseRelativeDate(review.createdAt)}</span>
				{/snippet}
			</MobileListItem>
		{/each}
	{/if}
</div>

<style lang="scss">
	.review-empty-row td {
		text-align: center;
		font-weight: 400;
		color: var(--gray-text);
	}

	.mobile-list-shell .empty {
		padding: 0.6rem;
		color: var(--gray-text);
	}
</style>
