<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	import Footer from './_components/Footer.svelte';
	import NavBar from './_components/NavBar.svelte';

	import { popClientFlash } from '$lib/shared/flash.js';
	import type { FlashMessage } from '$lib/types/flash.type.js';

	import Slideshow from './_components/Slideshow.svelte';

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
			<button class="{flash.kind}-btn" type="button" aria-label="메시지 닫기" onclick={() => (flash = null)}>닫기</button>
		</div>
	{/if}
{/snippet}

{#if page.route.id === '/'}
	<NavBar isMain={true} />
	{@render Flash()}
	<Slideshow />
{:else}
	<NavBar isMain={false} />
	{@render Flash()}
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
			max-width: 82.5vw;
		}
	}

	.flash-banner {
		position: fixed;
		top: 4rem;
		z-index: 999;
		min-width: 40vw;
		width: fit-content;
		transform: translate(-50%, 0);
		left: 50%;
		display: flex;
		justify-content: space-between;
		padding-right: .6rem;

		p {
			margin: 0;
		}

		button {
			flex-shrink: 0;
		}
	}
</style>
