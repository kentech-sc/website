<script lang="ts">
	import type { Review } from '$lib/types/review.type.js';

	import ReviewArticle from '../_components/ReviewArticle.svelte';
	import ReviewHeader from '../_components/ReviewHeader.svelte';

	let { data } = $props();
	const review = $derived<Review>(data.review);
	const permissions = $derived(data.permissions);
</script>

<ReviewHeader pageType="detail" />
<ReviewArticle {review} {permissions} />
