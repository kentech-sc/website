<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, description, children }: { title: string; description: string; children?: Snippet } =
		$props();
</script>

<header class="module">
	<h1>{title}</h1>

	<div>
		<p class="description">{description}</p>
		<div class="container-col">
			{#if children}
				{@render children()}
			{/if}
		</div>
	</div>

	<hr />
</header>

<style lang="scss">
	header {
		margin: 0 0 1rem 0;
		box-shadow: none;
		border: none;
		padding: 0;

		& > div {
			display: flex;
			justify-content: space-between;
			align-items: center;

			div {
				gap: .4rem;
				align-items: flex-end;
			}
		}
	}

	h1 {
		font-size: 1.8rem;
	}

	.description {
		font-weight: 600;
		font-size: 0.8rem;
	}
</style>
