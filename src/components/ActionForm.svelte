<script lang="ts">
	import type { ActionSimpleCallback, ActionFormPolicy } from '$lib/types/general.type.js';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
	import type { Snippet } from 'svelte';

	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { getActionResultMessage, isDetailPolicy } from '$lib/shared/action-result.js';
	import { setClientFlash } from '$lib/shared/flash.js';
	import { resolveInternalPath } from '$lib/shared/paths.js';

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
		policy?: ActionFormPolicy;
		afterSuccess?: ActionSimpleCallback;
		afterConflict?: ActionSimpleCallback;
	} = $props();

	let errorMsg = $derived(
		formResult?.type === 'failure' || formResult?.type === 'error'
			? getActionResultMessage(formResult)
			: ''
	);

	function shouldInvalidateOnSuccess(currentPolicy: ActionFormPolicy): boolean {
		return currentPolicy === 'reload' || isDetailPolicy(currentPolicy);
	}

	function shouldInvalidateOnNotFound(currentPolicy: ActionFormPolicy): boolean {
		return currentPolicy === 'reload';
	}

	function shouldInvalidateOnConflict(currentPolicy: ActionFormPolicy): boolean {
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
					await goto(resolveInternalPath(result.location));
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
							await goto(resolveInternalPath(policy.notFoundRedirectTo));
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

<form
	data-loading={loading ? 'true' : 'false'}
	aria-busy={loading}
	method="POST"
	{...formName ? { id: formName } : {}}
	{...actionName ? { action: `?/${actionName}` } : {}}
	{...isFile ? { enctype: 'multipart/form-data' } : {}}
	use:enhance={formHandle}
>
	<fieldset disabled={loading}>
		{@render children()}
	</fieldset>
</form>

{#if errorMsg}
	<p class="error">
		{errorMsg}
	</p>
{/if}

<style lang="scss">
	form {
		align-self: stretch;
		min-width: 0;
	}
	fieldset {
		display: flex;
		flex-direction: column;
	}
	form[data-loading='true'],
	form[data-loading='true'] :global(*) {
		cursor: wait;
	}
	p {
		justify-content: flex-start;
	}
</style>
