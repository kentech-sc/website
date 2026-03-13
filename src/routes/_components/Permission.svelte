<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { User } from '$lib/types/user.type.js';
	import type { UserGroup } from '$lib/types/user.type.js';
	import { hasMinRole, isOwner } from '$lib/common/permission.js';

	let { user, minRole, ownerId, children }: {
		user: User;
		minRole?: UserGroup;
		ownerId?: unknown;
		children: Snippet;
	} = $props();

	const allowed = $derived(
		(ownerId !== undefined && isOwner(user, ownerId)) ||
		(minRole !== undefined && hasMinRole(user, minRole))
	);
</script>

{#if allowed}
	{@render children()}
{/if}
