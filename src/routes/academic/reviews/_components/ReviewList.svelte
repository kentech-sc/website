<script lang="ts">
	import ReviewListItem from './ReviewListItem.svelte';

	import type { Page } from '$lib/types/general.type';
	import type { Review } from '$lib/types/review.type';

	import PaginatedList from '$components/PaginatedList.svelte';

	const { reviewPage }: { reviewPage: Page<Review> } = $props();
</script>

<PaginatedList page={reviewPage} emptyMessage="작성된 강의평가가 없습니다.">
	{#snippet item(review)}
		<ReviewListItem {review} />
	{/snippet}
</PaginatedList>
