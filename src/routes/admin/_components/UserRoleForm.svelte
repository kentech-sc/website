<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import Users from '@lucide/svelte/icons/users';

	import type { UserAdminOption } from '$lib/types/user.type.js';

	import ActionForm from '$components/ActionForm.svelte';
	import FormField from '$components/FormField.svelte';

	let { users }: { users: UserAdminOption[] } = $props();

	function handleSuccess() {
		alert('권한이 변경되었습니다.');
	}
</script>

<ActionForm
	actionName="changeGroup"
	formName="changeGroup"
	policy="reload"
	afterSuccess={handleSuccess}
>
	<div class="settings-form">
		<h4>
			<Users size="0.8rem" />
			<span>권한 변경</span>
		</h4>

		<FormField inputId="group-user-id" label="대상 사용자">
			<select name="user-id" id="group-user-id" required>
				<option value="">사용자 선택</option>
				{#each users as user (user.id)}
					<option value={user.id}>
						{user.realName} · {user.email} · @{user.nickname} ({user.group})
					</option>
				{/each}
			</select>
		</FormField>

		<FormField inputId="group-role" label="새로운 권한">
			<select name="group" id="group-role" required>
				<option value="">권한 선택</option>
				<option value="user">user</option>
				<option value="moderator">moderator</option>
				<option value="manager">manager</option>
				<option value="auditor">auditor</option>
			</select>
		</FormField>

		<button type="submit" class="ui-button is-primary">
			<Pencil size="0.8rem" />
			<span>변경하기</span>
		</button>
	</div>
</ActionForm>
