<script lang="ts">
	import type { User } from '$lib/types/user.type.js';

	import ChoiceTabs from '$components/ChoiceTabs.svelte';
	import { createDisplayName } from '$lib/shared/utils.js';
	import { DisplayType } from '$lib/types/user.type.js';

	let {
		user,
		displayType = $bindable<DisplayType>(DisplayType.Anonymous)
	}: {
		user: User;
		displayType?: DisplayType;
	} = $props();
</script>

<div class="display-type-selector container">
	<ChoiceTabs
		name="displayType"
		options={[
			{ value: DisplayType.Anonymous, label: '익명' },
			{ value: DisplayType.Nickname, label: '별명' },
			{ value: DisplayType.RealName, label: '실명' }
		]}
		bind:value={displayType}
	/>
	<span class="display-name">{createDisplayName(user, displayType)}</span>
</div>

<style lang="scss">
	.display-type-selector {
		gap: 0.8rem;
	}

	.display-name {
		font-weight: 600;
		font-size: 0.9rem;
	}
</style>
