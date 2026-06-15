<script lang="ts">
	import type { Page } from '$lib/types/general.type';
	import type { Review } from '$lib/types/review.type';

	import CommonList from '$components/CommonList.svelte';

	const { reviewPage }: { reviewPage: Page<Review> } = $props();
</script>

<section class="container-col module">
	{#if reviewPage.items.length === 0}
		<p>작성된 강의평가가 없습니다.</p>
	{:else}
		<CommonList href="/review" page={reviewPage} filePresence={{}} />
	{/if}
</section>

<style lang="scss">
	section {
		padding: 0;
	}

	p {
		padding: 0.8rem 1rem;
		width: 100%;
	}
</style>
