<script lang="ts">
	import '$lib/style/main.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<h1><a href="/">학생회 웹사이트</a></h1>
{@render children?.()}
