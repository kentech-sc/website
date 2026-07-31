<script lang="ts">
	import { onMount } from 'svelte';

	import BlockForm from './_components/BlockForm.svelte';
	import ChangeGroupForm from './_components/ChangeGroupForm.svelte';
	import ChangeNicknameForm from './_components/ChangeNicknameForm.svelte';
	import CleanupForm from './_components/CleanupForm.svelte';
	import DeleteUserForm from './_components/DeleteUserForm.svelte';
	import Profile from './_components/Profile.svelte';
	import PushNotificationForm from './_components/PushNotificationForm.svelte';
	import InstallAppPrompt from '../profile/_components/InstallAppPrompt.svelte';

	import { page } from '$app/state';

	type NavigatorWithStandalone = Navigator & {
		standalone?: boolean;
	};

	const user = $derived(page.data.user);
	const permissions = $derived(page.data.permissions);
	const userAdminOptions = $derived(page.data.userAdminOptions);
	let runningAsInstalledApp = $state(false);

	function updateDisplayMode() {
		const navigatorWithStandalone = navigator as NavigatorWithStandalone;

		runningAsInstalledApp =
			window.matchMedia('(display-mode: standalone)').matches ||
			navigatorWithStandalone.standalone === true ||
			document.referrer.startsWith('android-app://');
	}

	onMount(() => {
		const displayMode = window.matchMedia('(display-mode: standalone)');

		updateDisplayMode();
		displayMode.addEventListener('change', updateDisplayMode);

		return () => {
			displayMode.removeEventListener('change', updateDisplayMode);
		};
	});
</script>

<section class="profile">
	<div class="module">
		<Profile {user} />
	</div>

	<div class="container-col">
		<div class="module container-col">
			<h3>사용자 기능</h3>
			{#if runningAsInstalledApp}
				<PushNotificationForm />
			{:else}
				<InstallAppPrompt />
			{/if}
			<ChangeNicknameForm />
			<DeleteUserForm />
		</div>

		{#if permissions.canManageUsers}
			<div class="module container-col">
				<h3>관리자 기능</h3>
				<BlockForm users={userAdminOptions} />
				<ChangeGroupForm users={userAdminOptions} />
			</div>
		{/if}

		{#if permissions.canCleanup}
			<div class="module container-col">
				<h3>개발자 기능</h3>
				<CleanupForm />
			</div>
		{/if}
	</div>
</section>

<style lang="scss">
	@use 'media';

	.profile {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: flex-start;
		gap: 1rem;
		width: stretch;

		@include media.pc {
			grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
		}

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
