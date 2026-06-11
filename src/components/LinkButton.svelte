<script lang="ts">
	import type { Snippet } from 'svelte';

	let { href, children }: { href: string; children: Snippet } = $props();
</script>

<a {href} class="link-btn">
	{@render children()}
</a>

<style lang="scss">
	.link-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;

		padding: 0.2rem 0.4rem;
		background-color: var(--secondary);
		color: var(--tertiary-text);

		border-radius: 0.2rem;
		text-decoration: none;
		font-size: 0.8rem;
		transition: opacity 0.2s ease;

		&:hover {
			opacity: 0.9;
			text-decoration: none;
		}
	}
</style>
