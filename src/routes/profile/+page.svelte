<script lang="ts">
	import { page } from '$app/state';

	import BlockForm from './_components/BlockForm.svelte';
	import ChangeGroupForm from './_components/ChangeGroupForm.svelte';
	import ChangeNicknameForm from './_components/ChangeNicknameForm.svelte';
	import CleanupForm from './_components/CleanupForm.svelte';
	import DeleteUserForm from './_components/DeleteUserForm.svelte';
	import Profile from './_components/Profile.svelte';

	const user = $derived(page.data.user);
	const permissions = $derived(page.data.permissions);
</script>

<div class="profile-container">
	<div class="profile-section">
		<Profile {user} />
	</div>

	<div class="settings-section">
		<ChangeNicknameForm />
		<DeleteUserForm />

		{#if permissions.canManageUsers}
			<div class="admin-section">
				<h3>관리자 기능</h3>
				<BlockForm />
				<ChangeGroupForm />
			</div>
		{/if}

		{#if permissions.canCleanup}
			<div class="dev-section">
				<h3>개발자 기능</h3>
				<CleanupForm />
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.profile-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		max-width: 100rem;
		margin: 0 auto;
		padding: 2rem;

		@media (max-width: 768px) {
			grid-template-columns: 1fr;
			gap: 1.5rem;
			padding: 1rem;
		}
	}

	.profile-section {
		height: fit-content;
	}

	.settings-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.admin-section,
	.dev-section {
		background: var(--surface-elevated);
		border: 0.1rem solid var(--gray-border);
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 0.1rem 0.3rem var(--shadow-color);

		h3 {
			margin: 0 0 1rem;
			font-size: 1.1rem;
			font-weight: 600;
			color: var(--text);
			border-bottom: 0.1rem solid var(--gray-border);
			padding-bottom: 0.5rem;
		}

		:deep(.module) {
			margin-bottom: 1rem;
			border: none;
			border-radius: 0.4rem;
			background: var(--surface-elevated);
			padding: 1.5rem;
			box-shadow: 0 0.1rem 0.3rem var(--shadow-color);

			&:last-child {
				margin-bottom: 0;
			}
		}
	}
</style>
