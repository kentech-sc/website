<script lang="ts">
	import { page } from '$app/state';

	import BlockForm from './_components/BlockForm.svelte';
	import ChangeGroupForm from './_components/ChangeGroupForm.svelte';
	import ChangeNicknameForm from './_components/ChangeNicknameForm.svelte';
	import Profile from './_components/Profile.svelte';
	import CleanupForm from './_components/CleanupForm.svelte';
	import DeleteUserForm from './_components/DeleteUserForm.svelte';

	const user = $derived(JSON.parse(page.data.user ?? '{}'));
</script>

<div class="profile-container">
	<!-- 프로필 섹션 -->
	<div class="profile-section">
		<Profile {user} />
	</div>

	<!-- 설정 섹션 -->
	<div class="settings-section">
		<ChangeNicknameForm />
		<DeleteUserForm />

		{#if user?.group === 'manager' || user?.group === 'dev'}
			<div class="admin-section">
				<h3>관리자 기능</h3>
				<BlockForm />
				<ChangeGroupForm />
			</div>
		{/if}

		{#if user?.group === 'dev'}
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
		max-width: 1000px;
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
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

		h3 {
			margin: 0 0 1rem 0;
			font-size: 1.1rem;
			font-weight: 600;
			color: #1f2937;
			border-bottom: 1px solid #e5e7eb;
			padding-bottom: 0.5rem;
		}

		// 각 폼 컴포넌트에 대한 스타일
		:deep(.module) {
			margin-bottom: 1rem;
			border: none;
			border-radius: 0.375rem;
			background: white;
			padding: 1.5rem;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

			&:last-child {
				margin-bottom: 0;
			}
		}
	}
</style>
