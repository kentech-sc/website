<script lang="ts">
	import BannerManager from './_components/BannerManager.svelte';
	// import OrphanFileCleanupForm from './_components/OrphanFileCleanupForm.svelte';
	import PushBroadcastForm from './_components/PushBroadcastForm.svelte';
	import UserBlockForms from './_components/UserBlockForms.svelte';
	import UserRoleForm from './_components/UserRoleForm.svelte';

	import PageHeader from '$components/PageHeader.svelte';
	import PanelHeader from '$components/PanelHeader.svelte';

	let { data } = $props();
</script>

<section class="page">
	<PageHeader title="관리" description="권한에 따라 사용자와 사이트 운영 기능을 관리합니다." />

	{#if data.permissions.canManageBanner}
		<section class="module">
			<PanelHeader title="배너 관리" />
			<BannerManager banners={data.banners} />
		</section>
	{/if}

	{#if data.permissions.canSendPush}
		<section class="module">
			<PanelHeader title="전체 알림" />
			<PushBroadcastForm />
		</section>
	{/if}

	{#if data.permissions.canManageUsers}
		<section class="module">
			<PanelHeader title="사용자 관리" />
			<UserRoleForm users={data.userAdminOptions} />
			<UserBlockForms users={data.userAdminOptions} />
		</section>
	{/if}

	<!-- {#if data.permissions.canCleanup}
		<section class="module">
			<PanelHeader title="시스템 정리" />
			<OrphanFileCleanupForm />
		</section>
	{/if} -->
</section>
