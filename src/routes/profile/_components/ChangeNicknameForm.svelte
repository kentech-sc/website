<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import UserRoundPen from '@lucide/svelte/icons/user-round-pen';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';

	function handleSuccess() {
		alert('별명이 변경되었습니다.');
	}
</script>

<CommonForm
	actionName="changeNickname"
	formName="changeNickname"
	policy="reload"
	afterSuccess={handleSuccess}
>
	<div class="container-col">
		<p>
			<UserRoundPen size="0.8rem" />
			<span>별명 변경</span>
		</p>

		<CommonLabel labelFor="nickname" labelString="새로운 별명">
			<input
				type="text"
				name="nickname"
				id="nickname"
				placeholder="4자 이상의 새로운 별명을 입력하세요"
				required
				minlength="4"
			/>
		</CommonLabel>

		<button type="submit" class="info-btn">
			<Pencil size="0.8rem" />
			<span>변경하기</span>
		</button>
	</div>
</CommonForm>

<style lang="scss">
	p {
		width: 100%;
		font-weight: 500;
		text-align: left;
	}

	button {
		margin-top: 0.6rem;
		margin-left: auto;
	}
</style>
