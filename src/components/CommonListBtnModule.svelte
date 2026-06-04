<script lang="ts">
	let { prevHref, nextHref }: { prevHref?: string; nextHref?: string } = $props();
</script>

{#snippet PrevBtn()}
	{#if prevHref}
		<a href={prevHref} class="btn-anchor">이전</a>
	{:else}
		<span class="btn-anchor-disabled">이전</span>
	{/if}
{/snippet}

{#snippet NextBtn()}
	{#if nextHref}
		<a href={nextHref} class="btn-anchor">다음</a>
	{:else}
		<span class="btn-anchor-disabled">다음</span>
	{/if}
{/snippet}

<div class="container">
	{@render PrevBtn()}
	{@render NextBtn()}
</div>

<style lang="scss">
	div {
		margin-top: 0.5rem;
	}
</style>
