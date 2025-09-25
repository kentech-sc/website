<script lang="ts">
	import { page } from '$app/state';
	import type { Review } from '$lib/review/types.js';
	import ReviewArticle from '../_components/ReviewArticle.svelte';
	import ReviewHeader from '../_components/ReviewHeader.svelte';

	const user = JSON.parse(page.data.user);

	let { data } = $props();

	let review = $state<Review>(JSON.parse(data?.review || '{}'));
</script>

<ReviewHeader pageType="detail" />
<ReviewArticle {review} {user} />
