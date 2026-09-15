<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	import type { Banner } from '$lib/types/banner.type.js';

	let { banners }: { banners: Banner[] } = $props();

	const INTERVAL_MS = 5000;

	let current = $state(0);
	// 마우스를 올렸거나 키보드 포커스가 안에 있으면 멈춘다. 읽는 도중에 넘어가지 않게.
	let hovered = $state(false);
	let focused = $state(false);
	// 수동으로 넘기면 값을 바꿔 타이머를 처음부터 다시 센다.
	let restartKey = $state(0);

	const isSlider = $derived(banners.length > 1);

	// 관리자가 배너를 끄거나 지워 개수가 줄면 범위를 벗어난 위치를 되돌린다.
	const index = $derived(current < banners.length ? current : 0);

	function goTo(next: number) {
		current = (next + banners.length) % banners.length;
		restartKey += 1;
	}

	$effect(() => {
		// 의존성으로 읽어 두어야 수동 이동 때 타이머가 다시 걸린다.
		void restartKey;
		if (!isSlider || hovered || focused) return;

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reducedMotion) return;

		const timer = setInterval(() => {
			// 다른 탭에 가 있는 동안에는 넘기지 않는다. 돌아왔을 때 보던 배너가 그대로 있게.
			if (document.hidden) return;
			current = (index + 1) % banners.length;
		}, INTERVAL_MS);

		return () => clearInterval(timer);
	});
</script>

{#if banners.length}
	<section
		class="banner module is-flush"
		aria-roledescription={isSlider ? '슬라이드' : undefined}
		aria-label="메인 배너"
		onmouseenter={() => (hovered = true)}
		onmouseleave={() => (hovered = false)}
		onfocusin={() => (focused = true)}
		onfocusout={() => (focused = false)}
	>
		<ul class="track" style="transform: translateX(-{index * 100}%)">
			{#each banners as banner, slideIndex (banner.id)}
				{@const isCurrent = slideIndex === index}
				<li
					class="slide"
					aria-roledescription={isSlider ? '슬라이드 항목' : undefined}
					aria-label={isSlider ? `${slideIndex + 1} / ${banners.length}` : undefined}
					aria-hidden={!isCurrent}
					inert={!isCurrent}
				>
					{#if banner.linkUrl}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- 관리자가 입력한 외부 주소 -->
						<a href={banner.linkUrl} target="_blank" rel="noreferrer noopener">
							<img src={banner.imagePath} alt={banner.imageAlt} />
						</a>
					{:else}
						<img src={banner.imagePath} alt={banner.imageAlt} />
					{/if}
				</li>
			{/each}
		</ul>

		{#if isSlider}
			<button
				type="button"
				class="arrow prev"
				aria-label="이전 배너"
				onclick={() => goTo(index - 1)}
			>
				<ChevronLeft size="1.2rem" />
			</button>
			<button
				type="button"
				class="arrow next"
				aria-label="다음 배너"
				onclick={() => goTo(index + 1)}
			>
				<ChevronRight size="1.2rem" />
			</button>

			<div class="dots">
				{#each banners as banner, slideIndex (banner.id)}
					<button
						type="button"
						class:selected={slideIndex === index}
						aria-label="{slideIndex + 1}번째 배너"
						aria-current={slideIndex === index}
						onclick={() => goTo(slideIndex)}
					></button>
				{/each}
			</div>
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
		position: relative;
		border-color: var(--gray-border);
		// navbar 바로 아래에 붙는 자리라 위쪽은 각지게 마감한다.
		border-start-start-radius: 0;
		border-start-end-radius: 0;
		background-color: var(--gray-bg);
		// IAB 표준 배너는 Billboard(970x250, 3.9:1)와 Leaderboard(728x90, 8.1:1) 사이에 놓인다.
		// 홍보 이미지가 담기면서도 아래 달력/학식을 밀어내지 않도록 그 중간인 6:1 로 잡았다.
		aspect-ratio: 6 / 1;
		overflow: hidden;

		@include media.mobile {
			// 모바일에서 6:1 을 유지하면 높이가 60px 밑으로 떨어져 글씨를 읽을 수 없다.
			// 비율을 키우면 이미지 좌우가 잘리므로, 잘림(약 17%)과 가독성이 균형을 이루는 4:1 로 둔다.
			// 배너 이미지는 가운데 60% 안에 핵심 내용이 오도록 받아야 한다.
			aspect-ratio: 4 / 1;
		}
	}

	.track {
		display: flex;
		transition: transform 0.5s ease-in-out;
		margin: 0;
		padding: 0;
		height: 100%;
		list-style: none;

		@media (prefers-reduced-motion: reduce) {
			transition: none;
		}
	}

	.slide {
		flex: 0 0 100%;
		height: 100%;
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

	// 배너 크기가 작아 화살표가 이미지를 가리지 않도록 평소엔 숨기고, 올렸을 때만 보인다.
	.arrow {
		display: flex;
		position: absolute;
		top: 50%;
		justify-content: center;
		align-items: center;
		transform: translateY(-50%);
		opacity: 0;
		transition: opacity 0.2s;
		border: none;
		border-radius: 50%;
		background-color: var(--white);
		padding: 0;
		width: 2rem;
		height: 2rem;
		color: var(--primary-text);

		&.prev {
			left: 0.6rem;
		}

		&.next {
			right: 0.6rem;
		}
	}

	.banner:hover .arrow,
	.arrow:focus-visible {
		opacity: 0.85;
	}

	// 터치 화면에는 올려놓기가 없으므로 화살표 대신 점을 누르거나 자동 넘김을 쓴다.
	@media (hover: none) {
		.arrow {
			display: none;
		}
	}

	.dots {
		display: flex;
		position: absolute;
		bottom: 0.5rem;
		left: 50%;
		gap: 0.3rem;
		transform: translateX(-50%);

		button {
			opacity: 0.6;
			border: none;
			border-radius: 1rem;
			background-color: var(--white);
			padding: 0;
			width: 0.5rem;
			height: 0.3rem;

			&.selected {
				opacity: 1;
				width: 1.2rem;
			}
		}
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
