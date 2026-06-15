<script lang="ts">
	import type { Snippet } from 'svelte';

	const {
		labelFor,
		labelString,
		children
	}: {
		labelFor: string;
		labelString: string;
		children: Snippet;
	} = $props();
</script>

<div>
	<label for={labelFor} class="input-label">{labelString}</label>
	{@render children()}
</div>

<style lang="scss">
	div {
		display: flex;
		position: relative;
		margin-top: 1.4rem;
		width: 100%;

		& > :global(*) {
			flex: 1;
		}

		& > :global(input),
		& > :global(select) {
			font-size: 0.9rem;
		}
	}
</style>
