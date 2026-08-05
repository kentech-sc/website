<script lang="ts">
	import ReviewForm from '../_components/ReviewForm.svelte';
	import ReviewHeader from '../_components/ReviewHeader.svelte';

	import type { Offering } from '$lib/types/academic.type.js';

	let { data } = $props();
	const reviewableOfferings = $derived<Offering[]>(data.reviewableOfferings);
</script>

<ReviewHeader pageType="new" />

<ReviewForm {reviewableOfferings} />
