<script lang="ts">
	import GridSection from './_components/GridSection.svelte';

	import type { Petition } from '$lib/types/petition.type.js';
	import type { Post } from '$lib/types/post.type.js';
	import type { Review } from '$lib/types/review.type.js';

	let { data } = $props();

	const reviews = $derived<Review[]>(data.reviews);
	const freePosts = $derived<Post[]>(data.freePosts);
	const noticePosts = $derived<Post[]>(data.noticePosts);
	const petitions = $derived<Petition[]>(data.petitions);
</script>

<div id="grid-container">
	<GridSection title="공지사항" items={noticePosts.slice(0, 5)} link="board/notice" />
	<GridSection title="청원" items={petitions.slice(0, 5)} link="petition" />
	<GridSection title="자유게시판" items={freePosts.slice(0, 5)} link="board/free" />
	<GridSection title="강의평가" items={reviews.slice(0, 5)} link="review" />
</div>

<style lang="scss">
	@use 'media';

	#grid-container {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
		width: 100%;

		@include media.mobile {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
