<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		tone = 'info',
		children,
		icon,
		actions
	}: {
		tone?: 'info' | 'warn' | 'error';
		children: Snippet;
		icon?: Snippet;
		actions?: Snippet;
	} = $props();
</script>

<aside data-tone={tone} role={tone === 'error' ? 'alert' : 'status'}>
	{#if icon}<span>{@render icon()}</span>{/if}
	<div>{@render children()}</div>
	{#if actions}<footer>{@render actions()}</footer>{/if}
</aside>

<style lang="scss">
	aside {
		--notice-bg: var(--info-bg);
		--notice-text: var(--info-text);
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 0.4rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		background: var(--notice-bg);
		padding: 0.6rem;
		color: var(--notice-text);
		font-size: 0.7rem;
	}
	aside[data-tone='warn'] {
		--notice-bg: var(--warn-bg);
		--notice-text: var(--warn-text);
	}
	aside[data-tone='error'] {
		--notice-bg: var(--error-bg);
		--notice-text: var(--error-text);
	}
	aside > span {
		display: flex;
		flex: 0 0 auto;
	}
	aside > div {
		flex: 1;
		min-width: 10rem;
	}
	aside > footer {
		margin-left: auto;
	}
</style>
