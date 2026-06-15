<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';

	import type { ActionResult } from '@sveltejs/kit';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';

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
		<div class="professor-form container">
			<CommonLabel labelFor="professorName" labelString="교수명">
				<input
					type="text"
					id="professorName"
					name="name"
					placeholder="교수님의 성함을 입력해 주세요 (예: 홍길동)"
					bind:this={profNameInput}
				/>
			</CommonLabel>
		</div>
		<button type="submit" class="action-btn">
			<Plus size="0.8rem" />추가하기
		</button>
	</CommonForm>

	{#if formResult?.type === 'success'}
		<p class="success">교수 정보가 추가되었습니다.</p>
	{/if}
</section>

<style lang="scss">
	section {
		gap: 0.6rem;
	}

	.professor-form {
		gap: 0.6rem;
	}

	.action-btn {
		margin-top: 0.6rem;
		margin-left: auto;
	}
</style>
