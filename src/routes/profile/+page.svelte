<script lang="ts">
	import { onMount } from 'svelte';

	import ChangeNicknameForm from './_components/ChangeNicknameForm.svelte';
	import DeleteUserForm from './_components/DeleteUserForm.svelte';
	import Profile from './_components/Profile.svelte';
	import PushNotificationForm from './_components/PushNotificationForm.svelte';
	import ResidenceForm from './_components/ResidenceForm.svelte';
	import InstallAppPrompt from '../profile/_components/InstallAppPrompt.svelte';

	import { page } from '$app/state';
	import PanelHeader from '$components/PanelHeader.svelte';

	type NavigatorWithStandalone = Navigator & {
		standalone?: boolean;
	};

	const user = $derived(page.data.user);
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

	<section class="module">
		<PanelHeader title="계정 설정" />
		{#if runningAsInstalledApp}
			<PushNotificationForm />
		{:else}
			<InstallAppPrompt />
		{/if}
		<ChangeNicknameForm />
		<ResidenceForm />
		<DeleteUserForm />
	</section>
</section>

<style lang="scss">
	@use 'media';

	.profile {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: flex-start;
		gap: 1rem;
		width: 100%;

		@include media.pc {
			grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
		}
	}
</style>
