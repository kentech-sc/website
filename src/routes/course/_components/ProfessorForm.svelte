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
		<div class="professor-form">
			<div class="field-group field-group-strong">
				<label for="professorName">교수명 추가</label>
				<input
					type="text"
					id="professorName"
					name="name"
					placeholder="교수님의 성함을 입력해 주세요 (예: 홍길동)"
					bind:this={profNameInput}
				/>
			</div>

			<div class="form-actions-end">
				<button type="submit" class="btn-action">추가하기</button>
			</div>
		</div>
	</CommonForm>

	{#if formResult?.type === 'success'}
		<p>교수 정보가 추가되었습니다.</p>
	{/if}
</section>

<style lang="scss">
	.professor-form {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.form-actions-end {
		margin-top: 0.4rem;
	}

	.btn-action {
		font-size: 0.9rem;
	}
</style>
