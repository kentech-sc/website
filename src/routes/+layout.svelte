<script lang="ts">
	import '$lib/style/main.css';
	import Footer from './_components/Footer.svelte';
	import NavBar from './_components/NavBar.svelte';
	import PanelGroup from './_components/PanelGroup.svelte';

	let { children } = $props();

</script>

<NavBar />

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
