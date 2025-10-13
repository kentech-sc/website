<script lang="ts">
	import CommonForm from '$lib/components/CommonForm.svelte';
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
	<CommonForm actionName="changeGroup" formName="changeGroup" bind:formResult>
		<div class="container" id="form-div">
			<label for="email">그룹을 변경할 사용자 이메일</label>
			<input type="text" name="email" id="email" required />
			<label for="group">새로운 그룹</label>
			<input type="text" name="group" id="group" required />
			<button>변경</button>
		</div>
	</CommonForm>
</section>
