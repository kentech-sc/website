<script lang="ts">
	import GridSection from './_components/GridSection.svelte';
	import HomeBanner from './_components/HomeBanner.svelte';
	// 달력 두 안을 비교하는 중. 쓰지 않는 쪽을 주석 처리한다. (.split 비율도 함께 바꿀 것)
	import HomeCalendar from './_components/HomeCalendarGrid.svelte';
	// import HomeCalendar from './_components/HomeCalendarList.svelte';
	import HomeDining from './_components/HomeDining.svelte';

	import type { PostPreview } from '$lib/types/post.type.js';
	import type { ReviewPreview } from '$lib/types/review.type.js';
	import type { SubmissionPreview } from '$lib/types/submission.type.js';

	let { data } = $props();

	const reviews = $derived<ReviewPreview[]>(data.reviews);
	const noticePosts = $derived<PostPreview[]>(data.noticePosts);
	const petitions = $derived<SubmissionPreview[]>(data.petitions);
	const feedback = $derived<SubmissionPreview[]>(data.feedback);
</script>

<div id="home">
	<HomeBanner banners={data.banners} />

	<div class="split">
		<HomeCalendar schedule={data.schedule} />
		<HomeDining menus={data.dining} />
	</div>

	<div id="grid-container">
		<GridSection title="공지사항" items={noticePosts} link="board/notice" />
		<GridSection title="청원" items={petitions} link="channel/petition" />
		<GridSection title="문의·건의" items={feedback} link="channel/feedback" />
		<GridSection title="강의평가" items={reviews} link="academic/review" />
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

	// 배너는 navbar 에 맞닿아야 위쪽 직각 마감이 이어져 보인다.
	// main 의 margin-top 1rem + padding-top 1rem 을 상쇄한다.
	#home > :global(.banner) {
		margin-top: -2rem;

		@include media.mobile {
			// 모바일은 main 의 margin-top 이 0 이라 padding 만 상쇄하면 된다.
			margin-top: -1rem;
		}
	}

	.split,
	#grid-container {
		display: grid;
		gap: 1rem;
		width: 100%;
	}

	// 달력이 학식보다 넓게 자리를 갖는다.
	.split {
		grid-template-columns: minmax(0, 7fr) minmax(0, 3fr);
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
