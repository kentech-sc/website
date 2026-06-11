<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		desktopClass = 'desktop-list-shell',
		mobileClass = 'mobile-list-shell',
		desktop,
		mobile,
		pagination
	}: {
		desktopClass?: string;
		mobileClass?: string;
		desktop: Snippet;
		mobile: Snippet;
		pagination?: Snippet;
	} = $props();
</script>

<section class={desktopClass}>
	{@render desktop()}
	{#if pagination}
		{@render pagination()}
	{/if}
</section>

<section class={mobileClass}>
	{@render mobile()}
	{#if pagination}
		{@render pagination()}
	{/if}
</section>
