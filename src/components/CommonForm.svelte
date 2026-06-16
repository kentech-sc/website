<script lang="ts">
	import type { ActionSimpleCallback, CommonFormPolicy } from '$lib/types/general.type.js';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
	import type { Snippet } from 'svelte';

	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { getActionResultMessage, isDetailPolicy } from '$lib/shared/action-result.js';
	import { setClientFlash } from '$lib/shared/flash.js';

	let {
		children,
		formName,
		actionName = '',
		isFile = false,
		formResult = $bindable<ActionResult | null>(null),
		loading = $bindable<boolean>(false),
		policy = 'inline',
		afterSuccess,
		afterConflict
	}: {
		children: Snippet;
		formName?: string;
		actionName?: string;
		isFile?: boolean;
		formResult?: ActionResult | null;
		loading?: boolean;
		policy?: CommonFormPolicy;
		afterSuccess?: ActionSimpleCallback;
		afterConflict?: ActionSimpleCallback;
	} = $props();

	let errorMsg = $derived(
		formResult?.type === 'failure' || formResult?.type === 'error'
			? getActionResultMessage(formResult)
			: ''
	);

	function shouldInvalidateOnSuccess(currentPolicy: CommonFormPolicy): boolean {
		return currentPolicy === 'reload' || isDetailPolicy(currentPolicy);
	}

	function shouldInvalidateOnNotFound(currentPolicy: CommonFormPolicy): boolean {
		return currentPolicy === 'reload';
	}

	function shouldInvalidateOnConflict(currentPolicy: CommonFormPolicy): boolean {
		return currentPolicy === 'reload' || isDetailPolicy(currentPolicy);
	}

	const formHandle: SubmitFunction = ({ cancel }) => {
		if (loading) {
			cancel();
			return;
		}

		loading = true;

		return async ({ result }) => {
			try {
				if (result.type === 'redirect') {
					await goto(result.location);
					return;
				}

				formResult = result;

				if (result.type === 'success') {
					await afterSuccess?.();

					if (shouldInvalidateOnSuccess(policy)) {
						await invalidateAll();
					}
					return;
				}

				if (result.type === 'failure') {
					const message = getActionResultMessage(result);

					if (result.status === 404) {
						if (isDetailPolicy(policy)) {
							setClientFlash({ kind: 'error', message });
							await goto(policy.notFoundRedirectTo);
							return;
						}

						if (shouldInvalidateOnNotFound(policy)) {
							await invalidateAll();
						}
					}

					if (result.status === 409) {
						await afterConflict?.();

						if (shouldInvalidateOnConflict(policy)) {
							await invalidateAll();
						}
					}
				}
			} finally {
				loading = false;
			}
		};
	};
</script>

<div
	class="common-form"
	data-loading={loading ? 'true' : 'false'}
	aria-busy={loading ? 'true' : 'false'}
>
	<form
		method="POST"
		{...formName ? { id: formName } : {}}
		{...actionName ? { action: `?/${actionName}` } : {}}
		{...isFile ? { enctype: 'multipart/form-data' } : {}}
		use:enhance={formHandle}
	>
		<fieldset disabled={loading} class="common-form-content">
			{@render children()}
		</fieldset>
	</form>
</div>

{#if errorMsg}
	<p class="error error-message">
		{errorMsg}
	</p>
{/if}

<style lang="scss">
	.common-form {
		width: 100%;
	}

	.common-form[data-loading='true'] {
		cursor: wait;
	}

	.common-form-content {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.common-form[data-loading='true'] .common-form-content {
		opacity: 0.7;
	}

	.common-form[data-loading='true'] .common-form-content :global(*) {
		cursor: wait;
	}

	.error-message {
		justify-content: left;
	}
</style>
