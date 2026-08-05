<script lang="ts">
	import X from '@lucide/svelte/icons/x';

	import type { Snippet } from 'svelte';

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

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});

	function close() {
		open = false;
	}

	function closeFromBackdrop(event: MouseEvent) {
		if (event.target === dialog) close();
	}
</script>

<button class:emphasis class="record-tool" type="button" onclick={() => (open = true)}>
	<span class="tool-icon">{@render icon()}</span>
	<span class="tool-copy"><strong>{title}</strong><small>{description}</small></span>
	<span class="tool-arrow" aria-hidden="true">→</span>
</button>

<dialog bind:this={dialog} onclose={close} onclick={closeFromBackdrop} aria-label={title}>
	<section class="dialog-panel">
		<header>
			<div>
				<h2>{title}</h2>
				<p>{description}</p>
			</div>
			<button type="button" class="close-button" onclick={close} aria-label="닫기" title="닫기">
				<X size="1rem" />
			</button>
		</header>
		<div class="dialog-body">{@render children()}</div>
	</section>
</dialog>

<style lang="scss">
	.record-tool,
	.tool-copy,
	header {
		display: flex;
	}
	.record-tool {
		align-items: center;
		gap: 0.65rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.7rem;
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
	dialog {
		border: 0;
		background: transparent;
		padding: 0;
		width: min(36rem, calc(100% - 2rem));
		max-width: none;
		max-height: calc(100dvh - 2rem);
		color: inherit;
	}
	dialog::backdrop {
		backdrop-filter: blur(1.5px);
		background: rgb(0 0 0 / 38%);
	}
	.dialog-panel {
		box-shadow: 0 1rem 3rem rgb(0 0 0 / 16%);
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.85rem;
		background: var(--white);
		max-height: calc(100dvh - 2rem);
		overflow: auto;
	}
	header {
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		padding: 0.85rem 0.95rem;
	}
	header h2,
	header p {
		margin: 0;
	}
	header h2 {
		font-size: 0.95rem;
	}
	header p {
		margin-top: 0.1rem;
		color: var(--gray-text);
		font-size: 0.72rem;
	}
	.close-button {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		border: 0;
		background: transparent;
		padding: 0.35rem;
		color: var(--gray-text);
	}
	.close-button:hover {
		color: inherit;
	}
	.dialog-body {
		padding: 0.9rem;
	}
	@media (max-width: 600px) {
		dialog {
			margin: auto auto 0.5rem;
			width: calc(100% - 1rem);
			max-height: calc(100dvh - 1rem);
		}
		.dialog-panel {
			max-height: calc(100dvh - 1rem);
		}
	}
</style>
