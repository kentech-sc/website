<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import type { ActionResult } from '@sveltejs/kit';

	import { setClientFlash } from '$lib/shared/flash.js';
	import {
		getActionResultMessage,
		isDetailPolicy,
		type ActionSimpleCallback,
		type CommonFormPolicy
	} from '$lib/shared/action-result.js';
	import type { Snippet } from 'svelte';

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

	function formHandle() {
		loading = true;

		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'redirect') {
				try {
					await goto(result.location);
				} finally {
					loading = false;
				}
				return;
			}

			formResult = result;

			if (result.type === 'success') {
				await afterSuccess?.();

				if (shouldInvalidateOnSuccess(policy)) {
					await invalidateAll();
				}

				setTimeout(() => {
					loading = false;
				}, 200);
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

			loading = false;
		};
	}
</script>

<div class="common-form">
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

	{#if errorMsg}
		<p class="error error-message">
			{errorMsg}
		</p>
	{/if}
</div>

<style lang="scss">
	.common-form {
		width: 100%;
	}

	.common-form-content {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.error-message {
		justify-content: left;
	}
</style>
