<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		metadata,
		actions
	}: {
		title: Snippet;
		metadata: Snippet;
		actions?: Snippet;
	} = $props();
</script>

<header>
	<div>
		<h2>{@render title()}</h2>
		<p>{@render metadata()}</p>
	</div>
	{#if actions}<nav aria-label="글 작업">{@render actions()}</nav>{/if}
</header>

<style lang="scss">
	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.8rem;
		margin-bottom: 0.4rem;
		border-bottom: var(--control-border-width) solid var(--gray-border);
		padding-bottom: 0.2rem;
	}

	header > div {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.2rem;
		min-width: 0;
	}

	h2 {
		font-weight: 600;
		font-size: 1.2rem;
	}

	p {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
		color: var(--gray-text);
		font-size: 0.7rem;
	}

	p :global(span) {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
	}

	nav {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		gap: 0.2rem;
	}
</style>
