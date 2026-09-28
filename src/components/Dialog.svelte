<script lang="ts">
	import X from '@lucide/svelte/icons/x';

	import type { Snippet } from 'svelte';
	let {
		title,
		description = '',
		open = $bindable(false),
		children
	}: { title: string; description?: string; open?: boolean; children: Snippet } = $props();
	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});

	const close = () => {
		open = false;
	};

	const closeFromBackdrop = (event: MouseEvent) => {
		if (event.target === dialog) close();
	};
</script>

<dialog bind:this={dialog} onclose={close} onclick={closeFromBackdrop} aria-label={title}>
	<section>
		<header>
			<div>
				<h2>{title}</h2>
				<p>{description}</p>
			</div>
			<button type="button" onclick={close} aria-label="닫기" title="닫기">
				<X size="1rem" />
			</button>
		</header>
		<div>{@render children()}</div>
	</section>
</dialog>

<style lang="scss">
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
		backdrop-filter: blur(0.1rem);
		background: rgb(0 0 0 / 38%);
	}
	dialog > section {
		box-shadow: 0 1rem 3rem rgb(0 0 0 / 16%);
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 1.4rem;
		background: var(--white);
		max-height: calc(100dvh - 2rem);
		overflow: auto;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		padding: 0.85rem 0.95rem;
	}
	header h2 {
		font-size: 0.95rem;
	}
	header p {
		margin-top: 0.1rem;
		color: var(--gray-text);
		font-size: 0.72rem;
	}
	header > button {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		border: 0;
		background: transparent;
		padding: 0.35rem;
		color: var(--gray-text);
	}
	header > button:hover {
		color: inherit;
	}
	section > div {
		padding: 0.9rem;
	}
	@media (width <= 600px) {
		dialog {
			margin: auto auto 0.5rem;
			width: calc(100% - 1rem);
			max-height: calc(100dvh - 1rem);
		}
		dialog > section {
			max-height: calc(100dvh - 1rem);
		}
	}
</style>
