<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, description, children }: { title: string; description: string; children?: Snippet } =
		$props();
</script>

<header>
	<div>
		<h1>{title}</h1>
		<p>{description}</p>
	</div>
	{#if children}{@render children()}{/if}
</header>

<style lang="scss">
	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		border-bottom: var(--control-border-width) solid var(--gray-border);
		padding-bottom: 0.4rem;
		width: 100%;
		min-width: 0;
	}

	h1 {
		font-size: 1.8rem;
	}

	p {
		font-weight: 600;
		font-size: 0.9rem;
	}
</style>
