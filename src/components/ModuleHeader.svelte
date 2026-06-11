<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		descriptionClass,
		showDivider = true,
		actions
	}: {
		title: string;
		description?: string;
		descriptionClass?: string;
		showDivider?: boolean;
		actions?: Snippet;
	} = $props();
</script>

<header class="container-col module_head module-head-layout">
	<h1>{title}</h1>

	{#if description || actions}
		<div class="container module-head-row">
			{#if description}
				<p class={descriptionClass ?? ''}>{description}</p>
			{/if}

			{#if actions}
				<div class="module-head-actions">
					{@render actions()}
				</div>
			{/if}
		</div>
	{/if}

	{#if showDivider}
		<hr />
	{/if}
</header>
