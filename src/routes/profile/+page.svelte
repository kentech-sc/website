<script lang="ts">
	import BlockForm from './_components/BlockForm.svelte';
	import ChangeGroupForm from './_components/ChangeGroupForm.svelte';
	import ChangeNicknameForm from './_components/ChangeNicknameForm.svelte';
	import CleanupForm from './_components/CleanupForm.svelte';
	import DeleteUserForm from './_components/DeleteUserForm.svelte';
	import Profile from './_components/Profile.svelte';

	import { page } from '$app/state';

	const user = $derived(page.data.user);
	const permissions = $derived(page.data.permissions);
</script>

<section class="profile">
	<div class="infos module">
		<Profile {user} />
	</div>

	<div class="container-col">
		<div class="settings module container-col">
			<h3>사용자 기능</h3>
			<ChangeNicknameForm />
			<DeleteUserForm />
		</div>

		{#if permissions.canManageUsers}
			<div class="admin module container-col">
				<h3>관리자 기능</h3>
				<BlockForm />
				<ChangeGroupForm />
			</div>
		{/if}

		{#if permissions.canCleanup}
			<div class="dev module container-col">
				<h3>개발자 기능</h3>
				<CleanupForm />
			</div>
		{/if}
	</div>
</section>

<style lang="scss">
	.profile {
		display: grid;
		grid-template-columns: 0.8fr 1fr;
		align-items: flex-start;
		gap: 1rem;
		margin-top: 2rem;
		width: 80%;

		& > div:last-child {
			gap: 1rem;
		}
	}

	.module {
		gap: 0.6rem;
	}

	h3 {
		border-bottom: 0.1rem solid var(--gray-border);
		width: 100%;
		font-weight: 600;
		font-size: 1.1rem;
	}
</style>
