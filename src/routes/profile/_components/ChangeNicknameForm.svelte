<script lang="ts">
	import User from '@lucide/svelte/icons/user';

	import type { ActionResult } from '@sveltejs/kit';

	import { invalidateAll } from '$app/navigation';
	import CommonForm from '$components/CommonForm.svelte';

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			alert('별명이 변경되었습니다.');
			invalidateAll();
		}
	});
</script>

<CommonForm actionName="changeNickname" formName="changeNickname" bind:formResult>
	<div class="form-card">
		<div class="form-card-header">
			<User size="1rem" />
			<span>별명 변경</span>
		</div>

		<div class="form-card-body-inline">
			<div class="field-group">
				<label for="nickname">새로운 별명</label>
				<input
					type="text"
					name="nickname"
					id="nickname"
					placeholder="4자 이상의 새로운 별명을 입력하세요"
					required
					minlength="4"
				/>
			</div>

			<button type="submit" class="info-btn">
				<User size="1rem" />
				<span>변경하기</span>
			</button>
		</div>
	</div>
</CommonForm>
