<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import Users from '@lucide/svelte/icons/users';

	import type { UserAdminOption } from '$lib/types/user.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';

	let { users }: { users: UserAdminOption[] } = $props();

	function handleSuccess() {
		alert('권한이 변경되었습니다.');
	}
</script>

<CommonForm
	actionName="changeGroup"
	formName="changeGroup"
	policy="reload"
	afterSuccess={handleSuccess}
>
	<div class="container-col">
		<h4>
			<Users size="0.8rem" />
			<span>권한 변경</span>
		</h4>

		<CommonLabel labelFor="group-user-id" labelString="대상 사용자">
			<select name="user-id" id="group-user-id" required>
				<option value="">사용자 선택</option>
				{#each users as user (user.id)}
					<option value={user.id}>
						{user.realName} · {user.email} · @{user.nickname} ({user.group})
					</option>
				{/each}
			</select>
		</CommonLabel>

		<CommonLabel labelFor="group-role" labelString="새로운 권한">
			<select name="group" id="group-role" required>
				<option value="">권한 선택</option>
				<option value="user">user</option>
				<option value="moderator">moderator</option>
				<option value="manager">manager</option>
			</select>
		</CommonLabel>

		<button type="submit" class="warn-btn">
			<Pencil size="0.8rem" />
			<span>변경하기</span>
		</button>
	</div>
</CommonForm>

<style lang="scss">
	h4 {
		width: 100%;
		font-weight: 500;
		font-size: 1rem;
	}

	button {
		margin-top: 0.6rem;
		margin-left: auto;
	}
</style>
