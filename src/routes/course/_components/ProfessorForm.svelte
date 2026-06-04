<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';

	import CommonForm from '$components/CommonForm.svelte';

	let formResult = $state<ActionResult | null>(null);
	let profNameInput = $state<HTMLInputElement | null>(null);

	$effect(() => {
		if (formResult?.type === 'success' && profNameInput) {
			profNameInput.value = '';
		}
	});
</script>

<section class="container-col module">
	<CommonForm actionName="addProfessor" formName="addProfessor" bind:formResult>
		<div class="container-col">
			<label for="name">교수님 추가</label>
			<input
				type="text"
				id="name"
				name="name"
				placeholder="교수님 성함을 입력하세요 (예: 홍길동)"
				bind:this={profNameInput}
			/>
			<div class="form-actions">
				<button type="submit" class="btn-action">추가하기</button>
			</div>
		</div>
	</CommonForm>
	{#if formResult?.type === 'success'}
		<p>교수님이 추가되었습니다.</p>
	{/if}
</section>

<style lang="scss">
	div {
		align-items: flex-start;

		label {
			font-weight: bold;
			margin-bottom: 0.5rem;
		}

		input {
			width: 100%;
			margin-bottom: 0.5rem;
		}

		.form-actions {
			width: 100%;
			display: flex;
			justify-content: flex-end;
		}

		.btn-action {
			padding: 0.4rem 1.2rem;
			font-size: 0.9rem;
		}
	}
</style>
