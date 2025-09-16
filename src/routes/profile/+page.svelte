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
			alert('성공!');
			invalidateAll();
		}
	});
</script>

<section class="module container-col">
	<h1>프로필</h1>
	{#if user}
		<p>이메일: {user?.email}</p>
		<p>실명: {user?.realName}</p>
		<p>별명: {user?.nickname}</p>
		<p>권한: {user?.group}</p>
		<button onclick={() => signOut()}>로그아웃</button>
	{:else}
		<p>로그인 필요</p>
	{/if}
</section>

<section class="module container-col">
	<CommonForm actionName="changeNickname" formName="changeNickname" bind:formResult>
		<div class="container" id="form-div">
			<label for="nickname">새로운 별명</label>
			<input type="text" name="nickname" id="nickname" required />
			<button>변경</button>
		</div>
	</CommonForm>
</section>

{#if user?.group === 'manager' || user?.group === 'dev'}
	<section class="module container-col">
		<CommonForm actionName="blockUser" formName="blockUser" bind:formResult>
			<div class="container" id="form-div">
				<label for="email">차단할 사용자 이메일</label>
				<input type="text" name="email" id="email" required />
				<label for="duration">차단 기간 (분)</label>
				<input type="number" name="duration" id="duration" required />
				<button>차단</button>
			</div>
		</CommonForm>
	</section>
	<section class="module container-col">
		<CommonForm actionName="unblockUser" formName="unblockUser" bind:formResult>
			<div class="container" id="form-div">
				<label for="email">차단 해제할 사용자 이메일</label>
				<input type="text" name="email" id="email" required />
				<button>차단 해제</button>
			</div>
		</CommonForm>
	</section>
{/if}

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
