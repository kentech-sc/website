<script lang="ts">
	import GridSection from './_components/GridSection.svelte';
	import HomeBanner from './_components/HomeBanner.svelte';
	// 달력 두 안을 비교하는 중. 쓰지 않는 쪽을 주석 처리한다. (.split 비율도 함께 바꿀 것)
	import HomeCalendar from './_components/HomeCalendarGrid.svelte';
	// import HomeCalendar from './_components/HomeCalendarList.svelte';
	import HomeDining from './_components/HomeDining.svelte';

	import type { Petition } from '$lib/types/petition.type.js';
	import type { Post } from '$lib/types/post.type.js';
	import type { Review } from '$lib/types/review.type.js';

	let { data } = $props();

	const reviews = $derived<Review[]>(data.reviews);
	const freePosts = $derived<Post[]>(data.freePosts);
	const noticePosts = $derived<Post[]>(data.noticePosts);
	const petitions = $derived<Petition[]>(data.petitions);
</script>

<div id="home">
	<HomeBanner />

	<div class="split">
		<HomeCalendar />
		<HomeDining menus={data.dining} />
	</div>

	<div id="grid-container">
		<GridSection title="공지사항" items={noticePosts.slice(0, 5)} link="board/notice" />
		<GridSection title="청원" items={petitions.slice(0, 5)} link="petition" />
		<GridSection title="자유게시판" items={freePosts.slice(0, 5)} link="board/free" />
		<GridSection title="강의평가" items={reviews.slice(0, 5)} link="review" />
	</div>
</div>

<style lang="scss">
	@use 'media';

	#home {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}

	.split,
	#grid-container {
		display: grid;
		gap: 1rem;
		width: 100%;
	}

	// 목록안은 1:1, 격자안은 7열을 담아야 해서 2:1. 달력안을 바꿀 때 함께 교체한다.
	.split {
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
		// grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	#grid-container {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	// 두 열 설정보다 뒤에 와야 모바일에서 확실히 한 줄로 떨어진다.
	@include media.mobile {
		.split,
		#grid-container {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
