<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionResult } from '@sveltejs/kit';

	let {
		children,
		formName,
		actionName = '',
		isFile = false,
		formResult = $bindable(null),
		loading = $bindable<boolean>(false)
	} = $props();

	let errorMsg = $state<string>('');

	function formHandle() {
		loading = true;
		return async ({
			// update,
			result
		}: {
			// update: () => Promise<void>;
			result: ActionResult;
		}) => {
			console.log(result.type);
			if (result.type === 'success') {
				formResult = result;
				// await update();
				errorMsg = '';
				// 성공 시에도 약간의 지연 후 loading을 false로 설정하여 연타 방지
				setTimeout(() => {
					loading = false;
				}, 200);
			} else if (result.type === 'redirect') {
				goto(result.location);
				// 리디렉션 시에는 loading을 유지
			} else if (result.type === 'failure') {
				errorMsg = result.data?.message || '알 수 없는 오류가 발생했습니다.';
				loading = false;
			} else if (result.type === 'error') {
				errorMsg = result.error?.message || '알 수 없는 오류가 발생했습니다.';
				loading = false;
			}
		};
	}
</script>

<div id="common-form-div">
	<!-- data-sveltekit-replacestate -->
	<form
		method="POST"
		{...formName ? { id: formName } : {}}
		{...actionName ? { action: `?/${actionName}` } : {}}
		{...isFile ? { enctype: 'multipart/form-data' } : {}}
		use:enhance={formHandle}
	>
		<fieldset disabled={loading} id="common-form-content">
			{@render children()}
		</fieldset>
	</form>

	{#if errorMsg}
		<p id="error-msg" class="error">
			{errorMsg}
		</p>
	{/if}
</div>

<style lang="scss">
	#common-form-div {
		width: stretch;
	}

	fieldset {
		border: none;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	#error-msg {
		border-right: none;
		border-left: none;
		padding: 0.5rem;
	}
</style>
