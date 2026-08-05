<script lang="ts">
	import AcademicNav from './AcademicNav.svelte';
	import CommonHeader from './CommonHeader.svelte';

	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		canManageCatalog = false,
		children
	}: {
		title: string;
		description: string;
		canManageCatalog?: boolean;
		children?: Snippet;
	} = $props();
</script>

<div class="academic-heading">
	<CommonHeader {title} {description}>
		{#if children}{@render children()}{/if}
	</CommonHeader>
	<AcademicNav {canManageCatalog} />
</div>

<style lang="scss">
	.academic-heading {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.academic-heading > :global(header) {
		margin-bottom: 0;
	}
</style>
