<script lang="ts">
	import type { Banner } from '$lib/types/banner.type.js';

	let { banner }: { banner: Banner | null } = $props();
</script>

{#if banner}
	<section class="banner module is-flush">
		{#if banner.linkUrl}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- 관리자가 입력한 외부 주소 -->
			<a href={banner.linkUrl} target="_blank" rel="noreferrer noopener">
				<img src={banner.imagePath} alt={banner.imageAlt} />
			</a>
		{:else}
			<img src={banner.imagePath} alt={banner.imageAlt} />
		{/if}
	</section>
{:else}
	<!--
		배너를 올리기 전까지 자리를 확인하기 위한 임시 표시.
		실제 운영에서는 배너가 없으면 아무것도 그리지 않아야 하므로 이 블록은 지운다.
	-->
	<section class="banner placeholder module is-flush container-col">
		<span class="placeholder-label">배너</span>
		<p>등록된 배너가 없습니다</p>
	</section>
{/if}

<style lang="scss">
	@use 'media';

	.banner {
		border-color: var(--gray-border);
		background-color: var(--gray-bg);
		// IAB 표준 배너는 Billboard(970x250, 3.9:1)와 Leaderboard(728x90, 8.1:1) 사이에 놓인다.
		// 홍보 이미지가 담기면서도 아래 달력/학식을 밀어내지 않도록 그 중간인 6:1 로 잡았다.
		aspect-ratio: 6 / 1;

		@include media.mobile {
			// 모바일에서 6:1 을 유지하면 높이가 60px 밑으로 떨어져 글씨를 읽을 수 없다.
			// 비율을 키우면 이미지 좌우가 잘리므로, 잘림(약 17%)과 가독성이 균형을 이루는 4:1 로 둔다.
			// 배너 이미지는 가운데 60% 안에 핵심 내용이 오도록 받아야 한다.
			aspect-ratio: 4 / 1;
		}
	}

	a,
	img {
		display: block;
		width: 100%;
		height: 100%;
	}

	img {
		object-fit: cover;
	}

	// 임시 자리표시자. 실제 배너를 올리면 위 블록과 함께 지운다.
	.placeholder {
		justify-content: center;
		gap: 0.3rem;
		border-color: var(--tertiary);
		background: linear-gradient(100deg, var(--tertiary), var(--secondary));
		color: var(--tertiary-text);
	}

	.placeholder-label {
		opacity: 0.75;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
	}

	.placeholder p {
		margin: 0;
		font-size: 1.1rem;
	}
</style>
