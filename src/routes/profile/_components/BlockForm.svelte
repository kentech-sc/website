<script lang="ts">
	import Ban from '@lucide/svelte/icons/ban';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';

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
		<p>
			<Ban size="0.8rem" />
			<span>사용자 차단</span>
		</p>

		<CommonLabel labelFor="block-email" labelString="차단할 사용자의 이메일">
			<input type="text" name="email" id="block-email" placeholder="abc1234" />
			<span class="inline-container">@kentech.ac.kr</span>
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
		<p>
			<ShieldCheck size="0.8rem" />
			<span>차단 해제</span>
		</p>

		<CommonLabel labelFor="unblock-email" labelString="차단 해제할 사용자의 이메일">
			<input type="text" name="email" id="unblock-email" placeholder="abc1234" />
			<span class="inline-container">@kentech.ac.kr</span>
		</CommonLabel>

		<button type="submit" class="success-btn">
			<ShieldCheck size="0.8rem" />
			<span>해제하기</span>
		</button>
	</div>
</CommonForm>

<style lang="scss">
	p {
		width: 100%;
		font-weight: 500;
		text-align: left;
	}

	input + span {
		flex: 0;
		margin-left: 0.4rem;
		color: var(--gray);
		font-size: 0.9rem;
	}

	button {
		margin-top: 0.6rem;
		margin-left: auto;
	}
</style>
