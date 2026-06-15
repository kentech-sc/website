<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, description, children }: { title: string; description: string; children?: Snippet } =
		$props();
</script>

<header class="module">
	<h1>{title}</h1>

	<div>
		<p class="description">{description}</p>
		<div>
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>

	<hr />
</header>

<style lang="scss">
	header {
		margin: 1.6rem 0 1rem 0;
		box-shadow: none;
		border: none;
		padding: 0;

		& > div {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	}

	.description {
		font-weight: 600;
		font-size: 0.9rem;
	}
</style>
