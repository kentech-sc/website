<script lang="ts">
	import type { Review } from '$lib/review/types.js';
	import type { Post } from '$lib/board/types.js';
	import type { Petition } from '$lib/petition/types.js';
	import GridSection from './_components/GridSection.svelte';

	let { data } = $props();
	let reviews = $state<Review[]>(JSON.parse(data?.reviews || '[]'));
	let posts = $state<Post[]>(JSON.parse(data?.posts || '[]'));
	let petitions = $state<Petition[]>(JSON.parse(data?.petitions || '[]'));
</script>

<div class="primary" id="banner">
	<p>(대충 배너)</p>
</div>

<div class="secondary" id="calendar">
	<p>(대충 달력)</p>
</div>

<div class="tertiary" id="photo">
	<p>(대충 사진)</p>
</div>

<div id="grid-container">
	<GridSection title="공지사항" items={[]} link="" />
	<GridSection title="청원" items={petitions.slice(0, 5)} link="petition" />
	<GridSection title="자유게시판" items={posts.slice(0, 5)} link="board" />
	<GridSection title="강의평가" items={reviews.slice(0, 5)} link="review" />
</div>

<style lang="scss">
	#banner,
	#calendar,
	#photo {
		width: stretch;
		margin-top: 1rem;
	}

	#grid-container {
		width: stretch;
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin-top: 1rem;
	}
</style>
