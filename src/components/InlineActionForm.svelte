<script lang="ts">
	import type { ActionSimpleCallback, CommonFormPolicy } from '$lib/shared/action-result.js';
	import type { Snippet } from 'svelte';

	import CommonForm from '$components/CommonForm.svelte';

	let {
		actionName,
		formName,
		policy = 'inline',
		hiddenFields = [],
		buttonClass = '',
		confirmMessage,
		afterSuccess,
		afterConflict,
		children
	}: {
		actionName: string;
		formName?: string;
		policy?: CommonFormPolicy;
		hiddenFields?: Array<{ name: string; value: string | number }>;
		buttonClass?: string;
		confirmMessage?: string;
		afterSuccess?: ActionSimpleCallback;
		afterConflict?: ActionSimpleCallback;
		children: Snippet;
	} = $props();

	let confirmSubmitButton = $state<HTMLButtonElement | null>(null);

	function handleConfirmSubmit() {
		if (!confirmMessage || confirm(confirmMessage)) {
			confirmSubmitButton?.click();
		}
	}
</script>

<CommonForm {actionName} {formName} {policy} {afterSuccess} {afterConflict}>
	{#each hiddenFields as hiddenField (`${hiddenField.name}-${hiddenField.value}`)}
		<input type="hidden" name={hiddenField.name} value={String(hiddenField.value)} />
	{/each}

	<button
		type={confirmMessage ? 'button' : 'submit'}
		class={buttonClass}
		onclick={confirmMessage ? handleConfirmSubmit : undefined}
	>
		{@render children()}
	</button>

	{#if confirmMessage}
		<button hidden type="submit" bind:this={confirmSubmitButton}>submit</button>
	{/if}
</CommonForm>
