<script lang="ts">
	import type { User } from '$lib/types/user.type.js';

	import ChoiceTabs from '$components/ChoiceTabs.svelte';
	import { createDisplayName } from '$lib/shared/utils.js';
	import { AuthorNameMode } from '$lib/types/user.type.js';

	let {
		user,
		authorNameMode = $bindable<AuthorNameMode>(AuthorNameMode.Anonymous)
	}: {
		user: User;
		authorNameMode?: AuthorNameMode;
	} = $props();
</script>

<div class="author-name-selector container">
	<ChoiceTabs
		name="authorNameMode"
		options={[
			{ value: AuthorNameMode.Anonymous, label: '익명' },
			{ value: AuthorNameMode.Nickname, label: '별명' },
			{ value: AuthorNameMode.RealName, label: '실명' }
		]}
		bind:value={authorNameMode}
	/>
	<span class="author-name-preview">{createDisplayName(user, authorNameMode)}</span>
</div>

<style lang="scss">
	.author-name-selector {
		gap: 0.8rem;
	}

	.author-name-preview {
		font-weight: 600;
		font-size: 0.9rem;
	}
</style>
