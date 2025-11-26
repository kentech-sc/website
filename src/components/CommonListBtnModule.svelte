<script lang="ts">
	let { pageName, toId, fromId }: { pageName: string; toId: string | null; fromId: string | null } =
		$props();
</script>

{#snippet PrevBtn()}
	{#if toId}
		<a href={`/${pageName}?to=${toId}`} class="btn-anchor">이전</a>
	{:else}
		<span class="btn-anchor-disabled">이전</span>
	{/if}
{/snippet}

{#snippet NextBtn()}
	{#if fromId}
		<a href={`/${pageName}?from=${fromId}`} class="btn-anchor">다음</a>
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
