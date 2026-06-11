<script lang="ts">
	import Users from '@lucide/svelte/icons/users';

	import type { ActionResult } from '@sveltejs/kit';

	import { invalidateAll } from '$app/navigation';
	import CommonForm from '$components/CommonForm.svelte';

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			alert('권한이 변경되었습니다.');
			invalidateAll();
		}
	});
</script>

<CommonForm actionName="changeGroup" formName="changeGroup" bind:formResult>
	<div class="form-card group-form-card">
		<div class="form-card-header">
			<Users size="1rem" />
			<span>권한 변경</span>
		</div>

		<div class="form-card-body">
			<div class="field-group">
				<label for="group-email">대상 사용자의 이메일</label>
				<input type="text" name="email" id="group-email" placeholder="user@example.com" required />
			</div>

			<div class="field-group">
				<label for="group-role">새로운 권한</label>
				<select name="group" id="group-role" required>
					<option value="">권한 선택</option>
					<option value="user">user</option>
					<option value="moderator">moderator</option>
					<option value="manager">manager</option>
				</select>
			</div>

			<div class="form-actions-end">
				<button type="submit" class="warn-btn">
					<Users size="1rem" />
					<span>권한 변경하기</span>
				</button>
			</div>
		</div>
	</div>
</CommonForm>

<style lang="scss">
	.group-form-card {
		margin-top: 1.6rem;
	}
</style>
