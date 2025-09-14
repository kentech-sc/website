<script lang="ts">
	import { page } from '$app/state';
	import CommonForm from '$lib/assets/commonForm.svelte';
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';
	import { signOut } from '@auth/sveltekit/client';

	const user = $derived(JSON.parse(page.data.user ?? '{}'));

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			invalidateAll();
		}
	});
</script>

<section class="module container-col">
	<h1>프로필</h1>
	<p>이메일: {user?.email}</p>
	<p>실명: {user?.realName}</p>
	<p>별명: {user?.nickname}</p>
	<button onclick={() => signOut()}>로그아웃</button>
</section>

<section class="module container-col">
	<CommonForm actionName="changeNickname" formName="changeNickname" bind:formResult>
		<div class="container" id="form-div">
			<label for="nickname">새로운 별명</label>
			<input type="text" name="nickname" id="nickname" />
			<button>변경</button>
		</div>
	</CommonForm>
</section>

<style lang="scss">
	#form-div {
		* {
			margin: 0 0.5rem;
		}
	}
	section {
		width: stretch;
		margin: 0.5rem;
	}
</style>
