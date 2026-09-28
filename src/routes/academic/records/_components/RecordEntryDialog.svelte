<script lang="ts">
	import type { Snippet } from 'svelte';

	import Dialog from '$components/Dialog.svelte';

	let {
		title,
		description,
		open = $bindable(false),
		emphasis = false,
		icon,
		children
	}: {
		title: string;
		description: string;
		open?: boolean;
		emphasis?: boolean;
		icon: Snippet;
		children: Snippet;
	} = $props();
</script>

<button class:emphasis class="record-tool" type="button" onclick={() => (open = true)}>
	<span class="tool-icon">{@render icon()}</span>
	<span class="tool-copy"><strong>{title}</strong><small>{description}</small></span>
	<span class="tool-arrow" aria-hidden="true">→</span>
</button>

<Dialog {title} {description} bind:open>{@render children()}</Dialog>

<style lang="scss">
	.record-tool,
	.tool-copy {
		display: flex;
	}
	.record-tool {
		align-items: center;
		gap: 0.65rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 1.4rem;
		background: var(--white);
		padding: 0.75rem;
		width: 100%;
		min-height: 4rem;
		color: inherit;
		text-align: left;
	}
	.record-tool:hover {
		border-color: var(--secondary);
		background: color-mix(in srgb, var(--secondary) 3%, var(--white));
	}
	.record-tool.emphasis {
		border-color: color-mix(in srgb, var(--secondary) 42%, var(--gray-border));
	}
	.tool-icon {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--secondary) 10%, var(--white));
		width: 2rem;
		height: 2rem;
		color: var(--secondary);
	}
	.tool-copy {
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}
	.tool-copy strong {
		font-size: 0.82rem;
	}
	.tool-copy small {
		color: var(--gray-text);
		font-weight: 400;
		font-size: 0.7rem;
		line-height: 1.35;
	}
	.tool-arrow {
		flex: 0 0 auto;
		color: var(--gray-text);
		font-size: 0.9rem;
	}
</style>
