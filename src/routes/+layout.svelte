<script lang="ts">
	import Footer from './_components/Footer.svelte';
	import NavBar from './_components/NavBar.svelte';
	import Slideshow from './_components/Slideshow.svelte';

	import type { FlashMessage } from '$lib/types/flash.type.js';

	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { popClientFlash } from '$lib/shared/flash.js';

	import '$style/main.scss';

	let { children, data } = $props();

	let flash = $state<FlashMessage | null>(null);
	let navigationKey = $derived(`${page.url.pathname}${page.url.search}`);

	$effect(() => {
		void navigationKey;

		flash = data.flash ?? null;

		if (!browser) return;

		const clientFlash = popClientFlash();
		if (clientFlash) {
			flash = clientFlash;
		}
	});

	$effect(() => {
		if (!browser || !flash) return;
	});
</script>

{#snippet Flash()}
	{#if flash}
		<div class={`flash-banner ${flash.kind}`} role="status" aria-live="polite">
			<p>{flash.message}</p>
			<button
				class="{flash.kind}-btn"
				type="button"
				aria-label="메시지 닫기"
				onclick={() => (flash = null)}>닫기</button
			>
		</div>
	{/if}
{/snippet}

<NavBar />
{@render Flash()}

{#if page.route.id === '/'}
	<Slideshow />
{/if}

<div class="layout-shell container">
	<main class="container-col">
		{@render children?.()}
	</main>
</div>

<Footer />

<style lang="scss">
	.layout-shell {
		align-items: flex-start;

		main {
			flex: 1;
			max-width: 80vw;
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

		p {
			margin: 0;
		}

		button {
			flex-shrink: 0;
		}
	}
</style>
