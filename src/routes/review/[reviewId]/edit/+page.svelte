<script lang="ts">
	import ReviewForm from '../../_components/ReviewForm.svelte';
	import ReviewHeader from '../../_components/ReviewHeader.svelte';

	import type { Offering } from '$lib/types/academic.type.js';
	import type { Review } from '$lib/types/review.type.js';

	let { data } = $props();
	const review = $derived<Review>(data.review);
	const linkableOfferings = $derived<Offering[]>(data.linkableOfferings);
	const canLinkOffering = $derived<boolean>(data.permissions.canLinkOffering);
</script>

<ReviewHeader pageType="edit" />

{#key review.id}
	<ReviewForm {review} {linkableOfferings} {canLinkOffering} />
{/key}
