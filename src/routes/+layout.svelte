<script lang="ts">
	import '$style/main.css';

	import Footer from './_components/Footer.svelte';
	import NavBar from './_components/NavBar.svelte';
	// import PanelGroup from './_components/PanelGroup.svelte';

	import { page } from '$app/state';
	import Slideshow from './_components/Slideshow.svelte';

	let { children } = $props();
</script>

{#if page.route.id === '/'}
	<NavBar isMain={true} />
	<Slideshow />
{:else}
	<NavBar isMain={false} />
{/if}

<div id="layout" class="container">
	<main class="container-col">
		{@render children?.()}
	</main>
</div>

<Footer />

<style lang="scss">
	#layout {
		align-items: flex-start;

		main {
			flex: 1;
			max-width: 82.5vw;
		}
	}
</style>
