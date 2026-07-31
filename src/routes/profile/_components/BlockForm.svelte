<script lang="ts">
	import Ban from '@lucide/svelte/icons/ban';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';

	import type { UserAdminOption } from '$lib/types/user.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';

	let { users }: { users: UserAdminOption[] } = $props();

	function handleSuccess() {
		alert('처리가 완료되었습니다.');
	}
</script>

<CommonForm
	actionName="blockUser"
	formName="blockUser"
	policy="reload"
	afterSuccess={handleSuccess}
>
	<div class="container-col">
		<h4>
			<Ban size="0.8rem" />
			<span>사용자 차단</span>
		</h4>

		<CommonLabel labelFor="block-user-id" labelString="차단할 사용자">
			<select name="user-id" id="block-user-id" required>
				<option value="">사용자 선택</option>
				{#each users as user (user.id)}
					<option value={user.id}>
						{user.realName} · {user.email} · @{user.nickname} ({user.group})
					</option>
				{/each}
			</select>
		</CommonLabel>

		<CommonLabel labelFor="block-duration" labelString="차단 기간 (분)">
			<input type="number" name="duration" id="block-duration" placeholder="60" min="1" />
		</CommonLabel>

		<button type="submit" class="error-btn">
			<Ban size="0.8rem" />
			<span>차단하기</span>
		</button>
	</div>
</CommonForm>

<CommonForm
	actionName="unblockUser"
	formName="unblockUser"
	policy="reload"
	afterSuccess={handleSuccess}
>
	<div class="container-col">
		<h4>
			<ShieldCheck size="0.8rem" />
			<span>차단 해제</span>
		</h4>

		<CommonLabel labelFor="unblock-user-id" labelString="차단 해제할 사용자">
			<select name="user-id" id="unblock-user-id" required>
				<option value="">사용자 선택</option>
				{#each users.filter((user) => user.blockedUntil !== null) as user (user.id)}
					<option value={user.id}>
						{user.realName} · {user.email} · @{user.nickname}
					</option>
				{/each}
			</select>
		</CommonLabel>

		<button type="submit" class="success-btn">
			<ShieldCheck size="0.8rem" />
			<span>해제하기</span>
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
