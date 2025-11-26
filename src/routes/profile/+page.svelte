<script lang="ts">
	import { page } from '$app/state';

	import BlockForm from './_components/BlockForm.svelte';
	import ChangeGroupForm from './_components/ChangeGroupForm.svelte';
	import ChangeNicknameForm from './_components/ChangeNicknameForm.svelte';
	import Profile from './_components/Profile.svelte';

	const user = $derived(JSON.parse(page.data.user ?? '{}'));
</script>

<Profile {user} />

<ChangeNicknameForm />

{#if user?.group === 'manager' || user?.group === 'dev'}
	<BlockForm />
	<ChangeGroupForm />
{/if}
