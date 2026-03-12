<script lang="ts">
	import type { Snippet } from 'svelte';

	let { href, row1, row2 }: { href: string; row1: Snippet; row2: Snippet } = $props();
</script>

<a {href} class="mobile-item">
	<div class="row1">{@render row1()}</div>
	<div class="row2">{@render row2()}</div>
</a>

<style lang="scss">
	.mobile-item {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		padding: 0.7rem 0.8rem;
		border-bottom: solid var(--gray-border) 0.05rem;
		color: black;
		width: 100%;

		&:hover {
			background-color: var(--gray-bg);
			text-decoration: none;
		}

		.row1 {
			display: flex;
			align-items: center;
			gap: 0.3rem;

			:global(.title) {
				flex: 1;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				font-weight: bold;
				font-size: 1rem;
			}
		}

		.row2 {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 0.85rem;
			color: var(--gray-text);

			:global(.time) {
				flex-shrink: 0;
				margin-left: 0.5rem;
			}
		}
	}
</style>
