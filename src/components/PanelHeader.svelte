<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		title,
		description,
		children
	}: { title: string; description?: string; children?: Snippet } = $props();
</script>

<header class="panel-header">
	<div>
		<h2>{title}</h2>
		{#if description}<p>{description}</p>{/if}
	</div>
	{#if children}<div>{@render children()}</div>{/if}
</header>

<style lang="scss">
	header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 0.8rem;
		margin-bottom: 0.4rem;
		border-bottom: var(--control-border-width) solid var(--gray-border);
	}
	header > div {
		min-width: 0;
	}
	p {
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	h2 {
		font-size: 1.2rem;
	}
	header > div + div {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		max-width: 100%;
	}
</style>
