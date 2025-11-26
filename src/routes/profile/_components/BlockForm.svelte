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
	<CommonForm actionName="blockUser" formName="blockUser" bind:formResult>
		<div class="container" id="form-div">
			<label for="email">차단할 사용자 이메일</label>
			<input type="text" name="email" id="email" required />
			<label for="duration">차단 기간 (분)</label>
			<input type="number" name="duration" id="duration" required />
			<button>차단</button>
		</div>
	</CommonForm>
</section>

<section class="module container-col">
	<CommonForm actionName="unblockUser" formName="unblockUser" bind:formResult>
		<div class="container" id="form-div">
			<label for="email">차단 해제할 사용자 이메일</label>
			<input type="text" name="email" id="email" required />
			<button>차단 해제</button>
		</div>
	</CommonForm>
</section>
