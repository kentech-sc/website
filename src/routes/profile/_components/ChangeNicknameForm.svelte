<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';

	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			alert('성공!');
			invalidateAll();
		}
	});
</script>

<section class="module container-col">
	<CommonForm actionName="changeNickname" formName="changeNickname" bind:formResult>
		<div class="container" id="form-div">
			<label for="nickname">새로운 별명</label>
			<input type="text" name="nickname" id="nickname" required />
			<button>변경</button>
		</div>
	</CommonForm>
</section>
