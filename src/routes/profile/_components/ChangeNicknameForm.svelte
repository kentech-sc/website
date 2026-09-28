<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import UserRoundPen from '@lucide/svelte/icons/user-round-pen';

	import ActionForm from '$components/ActionForm.svelte';
	import FormField from '$components/FormField.svelte';

	function handleSuccess() {
		alert('별명이 변경되었습니다.');
	}
</script>

<ActionForm
	actionName="changeNickname"
	formName="changeNickname"
	policy="reload"
	afterSuccess={handleSuccess}
>
	<div class="settings-form">
		<h4>
			<UserRoundPen size="0.8rem" />
			<span>별명 변경</span>
		</h4>

		<FormField inputId="nickname" label="새로운 별명">
			<input
				type="text"
				name="nickname"
				id="nickname"
				placeholder="4자 이상의 새로운 별명을 입력하세요"
				required
				minlength="4"
			/>
		</FormField>

		<button type="submit" class="ui-button is-primary">
			<Pencil size="0.8rem" />
			<span>변경하기</span>
		</button>
	</div>
</ActionForm>
