<script lang="ts">
	import Ban from '@lucide/svelte/icons/ban';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';

	import type { UserAdminOption } from '$lib/types/user.type.js';

	import ActionForm from '$components/ActionForm.svelte';
	import FormField from '$components/FormField.svelte';

	let { users }: { users: UserAdminOption[] } = $props();

	function handleSuccess() {
		alert('처리가 완료되었습니다.');
	}
</script>

<ActionForm
	actionName="blockUser"
	formName="blockUser"
	policy="reload"
	afterSuccess={handleSuccess}
>
	<div class="settings-form">
		<h4>
			<Ban size="0.8rem" />
			<span>사용자 차단</span>
		</h4>

		<FormField inputId="block-user-id" label="차단할 사용자">
			<select name="user-id" id="block-user-id" required>
				<option value="">사용자 선택</option>
				{#each users as user (user.id)}
					<option value={user.id}>
						{user.realName} · {user.email} · @{user.nickname} ({user.group})
					</option>
				{/each}
			</select>
		</FormField>

		<FormField inputId="block-duration" label="차단 기간 (분)">
			<input type="number" name="duration" id="block-duration" placeholder="60" min="1" />
		</FormField>

		<button type="submit" class="ui-button is-danger">
			<Ban size="0.8rem" />
			<span>차단하기</span>
		</button>
	</div>
</ActionForm>

<ActionForm
	actionName="unblockUser"
	formName="unblockUser"
	policy="reload"
	afterSuccess={handleSuccess}
>
	<div class="settings-form">
		<h4>
			<ShieldCheck size="0.8rem" />
			<span>차단 해제</span>
		</h4>

		<FormField inputId="unblock-user-id" label="차단 해제할 사용자">
			<select name="user-id" id="unblock-user-id" required>
				<option value="">사용자 선택</option>
				{#each users.filter((user) => user.blockedUntil !== null) as user (user.id)}
					<option value={user.id}>
						{user.realName} · {user.email} · @{user.nickname}
					</option>
				{/each}
			</select>
		</FormField>

		<button type="submit" class="ui-button is-primary">
			<ShieldCheck size="0.8rem" />
			<span>해제하기</span>
		</button>
	</div>
</ActionForm>
