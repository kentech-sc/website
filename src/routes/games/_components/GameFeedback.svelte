<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Info from '@lucide/svelte/icons/info';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

	import type { Snippet } from 'svelte';

	let {
		tone,
		title,
		description,
		busy = false,
		actions
	}: {
		tone: 'info' | 'warn' | 'error' | 'success';
		title: string;
		description?: string;
		busy?: boolean;
		actions?: Snippet;
	} = $props();
</script>

<aside
	class="game-feedback"
	data-tone={tone}
	role={tone === 'error' ? 'alert' : 'status'}
	aria-busy={busy}
>
	<span class="feedback-icon" aria-hidden="true">
		{#if busy}<LoaderCircle class="is-spinning" size="0.9rem" />
		{:else if tone === 'error'}<CircleAlert size="0.9rem" />
		{:else if tone === 'warn'}<TriangleAlert size="0.9rem" />
		{:else if tone === 'success'}<CircleCheck size="0.9rem" />
		{:else}<Info size="0.9rem" />{/if}
	</span>
	<div class="feedback-body">
		<strong>{title}</strong>
		{#if description}<p>{description}</p>{/if}
		{#if actions}<div class="feedback-actions">{@render actions()}</div>{/if}
	</div>
</aside>

<style lang="scss">
	.game-feedback {
		--feedback-color: var(--secondary);
		display: flex;
		align-items: flex-start;
		gap: 0.55rem;
		border: var(--control-border-width) solid
			color-mix(in srgb, var(--feedback-color) 24%, var(--white));
		border-radius: 0.65rem;
		background: color-mix(in srgb, var(--feedback-color) 4%, var(--white));
		padding: 0.55rem 0.7rem;
		width: min(100%, 22rem);
		min-width: 0;
		text-align: left;
	}
	.game-feedback[data-tone='warn'] {
		--feedback-color: var(--warn);
	}
	.game-feedback[data-tone='error'] {
		--feedback-color: var(--error);
	}
	.game-feedback[data-tone='success'] {
		--feedback-color: var(--success);
	}
	.feedback-icon {
		display: flex;
		flex: none;
		justify-content: center;
		align-items: center;
		border-radius: 0.4rem;
		background: color-mix(in srgb, var(--feedback-color) 10%, var(--white));
		width: 1.5rem;
		height: 1.5rem;
		color: var(--feedback-color);
	}
	.feedback-body {
		flex: 1;
		align-self: center;
		min-width: 0;
	}
	strong {
		display: block;
		color: var(--text);
		font-weight: 600;
		font-size: 0.8rem;
		line-height: 1.35;
	}
	p {
		margin-top: 0.1rem;
		color: var(--gray-text);
		font-size: 0.7rem;
		line-height: 1.4;
		overflow-wrap: anywhere;
	}
	.feedback-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.4rem;
	}
	.feedback-icon :global(.is-spinning) {
		animation: feedback-spin 1s linear infinite;
	}
	@keyframes feedback-spin {
		to {
			transform: rotate(360deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.feedback-icon :global(.is-spinning) {
			animation: none;
		}
	}
</style>
