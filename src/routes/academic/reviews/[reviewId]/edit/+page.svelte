<script lang="ts">
	import ReviewForm from '../../_components/ReviewForm.svelte';
	import ReviewHeader from '../../_components/ReviewHeader.svelte';

	import type { Review } from '$lib/types/review.type.js';

	let { data } = $props();
	const review = $derived<Review>(data.review);
</script>

<section class="page">
	<ReviewHeader pageType="edit" />

	{#key review.id}
		<ReviewForm {review} />
	{/key}
</section>
