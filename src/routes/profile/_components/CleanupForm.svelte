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
	<CommonForm actionName="cleanup" formName="cleanup" bind:formResult>
		<div class="container" id="form-div">
			<input name="hours" type="number" value="0" />
			<span>시간 지난 파일</span>
			<button>청소하기</button>
		</div>
	</CommonForm>
</section>
