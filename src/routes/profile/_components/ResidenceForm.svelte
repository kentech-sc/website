<script lang="ts">
	import Save from '@lucide/svelte/icons/save';
	import UserRound from '@lucide/svelte/icons/user-round';

	import { page } from '$app/state';
	import ActionForm from '$components/ActionForm.svelte';
	import FormField from '$components/FormField.svelte';

	let gender = $derived(page.data.user.gender ?? '');
	let house = $derived(page.data.user.house ?? '');
</script>

<ActionForm
	actionName="changeResidence"
	formName="residence"
	policy="reload"
	afterSuccess={() => alert('성별과 하우스가 저장되었습니다.')}
>
	<div class="settings-form">
		<h4 id="personal-info"><UserRound size="0.8rem" /><span>기본 정보</span></h4>
		<FormField inputId="gender" label="성별">
			<select id="gender" name="gender" bind:value={gender} required>
				<option value="" disabled>성별 선택</option>
				<option value="male">남</option>
				<option value="female">여</option>
			</select>
		</FormField>
		<FormField inputId="house" label="하우스">
			<select id="house" name="house" bind:value={house} required>
				<option value="" disabled>하우스 선택</option>
				<option value="edison">에디슨</option>
				<option value="tesla">테슬라</option>
			</select>
		</FormField>
		<button type="submit" class="ui-button is-primary"
			><Save size="0.8rem" /><span>저장하기</span></button
		>
	</div>
</ActionForm>
