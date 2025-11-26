<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';

	import type { ActionResult } from '@sveltejs/kit';

	let formResult = $state<ActionResult | null>(null);
	let profNameInput = $state<HTMLInputElement | null>(null);
	$effect(() => {
		if (formResult?.type === 'success') {
			if (profNameInput) {
				profNameInput.value = '';
			}
		}
	});
</script>

<section class="container-col module">
	<CommonForm actionName="addProfessor" formName="addProfessor" bind:formResult>
		<div class="container-col">
			<label for="name">교수님 성함</label>
			<input type="text" id="name" name="name" bind:this={profNameInput} />
			<button type="submit">추가하기</button>
		</div>
	</CommonForm>
	{#if formResult?.type === 'success'}
		<p>교수님이 추가되었습니다.</p>
	{/if}
</section>

<style lang="scss">
	div {
		align-items: flex-start;

		input {
			width: stretch;
			margin-bottom: 0.5rem;
		}
	}
</style>
