<script lang="ts">
	import 'nprogress/nprogress.css';
	import NProgress from 'nprogress';
	import { MediaQuery } from 'svelte/reactivity';

	import Footer from './_components/Footer.svelte';
	import SiteHeader from './_components/SiteHeader.svelte';

	import type { FlashMessage } from '$lib/types/general.type.js';

	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { navigating } from '$app/state';
	import { BOARD_DEFINITIONS, isBoardId } from '$lib/shared/board.js';
	import { popClientFlash } from '$lib/shared/flash.js';

	import '$style/main.scss';

	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)', false);

	let { children, data } = $props();

	$effect(() => {
		NProgress.configure({
			showSpinner: false,
			speed: reducedMotion.current ? 0 : 200,
			trickle: !reducedMotion.current
		});
	});
	$effect(() => {
		if (navigating.to) NProgress.start();
		else NProgress.done();
	});

	let flash = $state<FlashMessage | null>(null);
	let navigationKey = $derived(`${page.url.pathname}${page.url.search}`);
	let pageTitle = $derived(titleForPath(page.url.pathname));

	function titleForPath(pathname: string): string {
		const boardId = pathname.split('/')[2];
		if (pathname.startsWith('/boards/') && isBoardId(boardId)) {
			return `${BOARD_DEFINITIONS[boardId].title} | 켄텍 총학생회`;
		}

		const sections: Array<[string, string]> = [
			['/academic/records', '성적·졸업'],
			['/academic/timetable', '시간표'],
			['/academic/reviews', '강의평가'],
			['/academic/offerings', '개설 강의 관리'],
			['/channel/petitions', '청원'],
			['/channel/feedback', '문의·건의'],
			['/bylaws', '회칙·세칙'],
			['/admin', '사이트 관리'],
			['/profile', '내 정보'],
			['/search', '검색'],
			['/signin', '로그인'],
			['/privacy', '개인정보처리방침'],
			['/terms', '서비스 이용약관']
		];
		const section = sections.find(([prefix]) => pathname.startsWith(prefix));
		return section ? `${section[1]} | 켄텍 총학생회` : '켄텍 총학생회';
	}

	$effect(() => {
		void navigationKey;

		flash = data.flash ?? null;

		if (!browser) return;

		const clientFlash = popClientFlash();
		if (clientFlash) {
			flash = clientFlash;
		}
	});
</script>

<svelte:head><title>{pageTitle}</title></svelte:head>

{#snippet Flash()}
	{#if flash}
		<div class={`flash-banner ${flash.kind}`} role="status" aria-live="polite">
			<p>{flash.message}</p>
			<button
				class="ui-button is-secondary"
				type="button"
				aria-label="메시지 닫기"
				onclick={() => (flash = null)}>닫기</button
			>
		</div>
	{/if}
{/snippet}

<SiteHeader />
{@render Flash()}

<div class="layout-shell">
	<main>
		{@render children?.()}
	</main>
</div>

<Footer />

<style lang="scss">
	@use 'media';

	.layout-shell {
		display: flex;
		justify-content: center;
		align-items: flex-start;

		main {
			display: flex;
			flex: 1;
			flex-direction: column;
			align-items: center;
			margin-top: 1rem;
			padding: 1rem;
			max-width: 80vw;

			@include media.mobile {
				margin-top: 0rem;
				max-width: 100vw;
			}
		}
	}

	.flash-banner {
		display: flex;
		position: fixed;
		top: 3.4rem;
		left: 50%;
		justify-content: space-between;
		transform: translate(-50%, 0);
		z-index: 999;
		padding-right: 0.6rem;
		width: fit-content;
		min-width: 40vw;

		button {
			flex-shrink: 0;
		}
	}
</style>
