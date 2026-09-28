<script lang="ts">
	import type { ActionSimpleCallback, ActionFormPolicy } from '$lib/types/general.type.js';
	import type { Snippet } from 'svelte';

	import ActionForm from '$components/ActionForm.svelte';

	let {
		actionName,
		formName,
		policy = 'inline',
		hiddenFields = [],
		buttonClass = '',
		buttonLabel,
		confirmMessage,
		afterSuccess,
		afterConflict,
		children
	}: {
		actionName: string;
		formName?: string;
		policy?: ActionFormPolicy;
		hiddenFields?: Array<{ name: string; value: string | number }>;
		buttonClass?: string;
		buttonLabel?: string;
		confirmMessage?: string;
		afterSuccess?: ActionSimpleCallback;
		afterConflict?: ActionSimpleCallback;
		children: Snippet;
	} = $props();

	let confirmSubmitButton = $state<HTMLButtonElement | null>(null);
	let loading = $state(false);

	function handleConfirmSubmit() {
		if (loading) return;

		if (!confirmMessage || confirm(confirmMessage)) {
			confirmSubmitButton?.click();
		}
	}
</script>

<ActionForm {actionName} {formName} {policy} {afterSuccess} {afterConflict} bind:loading>
	{#each hiddenFields as hiddenField (`${hiddenField.name}-${hiddenField.value}`)}
		<input type="hidden" name={hiddenField.name} value={String(hiddenField.value)} />
	{/each}

	<button
		type={confirmMessage ? 'button' : 'submit'}
		class={buttonClass}
		aria-label={buttonLabel}
		disabled={loading}
		data-busy={loading ? 'true' : 'false'}
		aria-busy={loading ? 'true' : 'false'}
		onclick={confirmMessage ? handleConfirmSubmit : undefined}
	>
		{@render children()}
	</button>

	{#if confirmMessage}
		<button hidden type="submit" bind:this={confirmSubmitButton} disabled={loading}>submit</button>
	{/if}
</ActionForm>
