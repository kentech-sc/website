<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	import Footer from './_components/Footer.svelte';
	import NavBar from './_components/NavBar.svelte';
	import Slideshow from './_components/Slideshow.svelte';

	import { popClientFlash } from '$lib/shared/flash.js';
	import type { FlashMessage } from '$lib/types/flash.type.js';

	import '$style/main.scss';

	let { children, data } = $props();

	let flash = $state<FlashMessage | null>(null);
	let navigationKey = $derived(`${page.url.pathname}${page.url.search}`);

	$effect(() => {
		navigationKey;

		flash = data.flash ?? null;

		if (!browser) return;

		const clientFlash = popClientFlash();
		if (clientFlash) {
			flash = clientFlash;
		}
	});

	$effect(() => {
		if (!browser || !flash) return;

		const timer = window.setTimeout(() => {
			flash = null;
		}, 5000);

		return () => window.clearTimeout(timer);
	});
</script>

{#if page.route.id === '/'}
	<NavBar isMain={true} />
	<Slideshow />
{:else}
	<NavBar isMain={false} />
{/if}

<div class="layout-shell container">
	<main class="container-col">
		{#if flash}
			<div class={`flash-banner ${flash.kind}`} role="status" aria-live="polite">
				<p>{flash.message}</p>
				<button type="button" aria-label="메시지 닫기" onclick={() => (flash = null)}>닫기</button>
			</div>
		{/if}
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
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.8rem 1rem;
		margin-bottom: 1rem;
		border: 0.1rem solid var(--gray-border);
		border-radius: 0.6rem;

		p {
			margin: 0;
		}

		button {
			flex-shrink: 0;
		}

		&.info {
			background: var(--info-bg);
		}

		&.success {
			background: var(--success-bg);
		}

		&.error {
			background: var(--error-bg);
		}
	}
</style>
