<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	let { user } = $props();
</script>

<section class="module container-col">
	<h1>프로필</h1>
	<hr />
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
