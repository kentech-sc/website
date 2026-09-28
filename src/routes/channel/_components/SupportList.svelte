<script lang="ts">
	let { supporterNames }: { supporterNames: string[] } = $props();
</script>

{#if supporterNames.length !== 0}
	<section class="module">
		{#each supporterNames as supporterName, idx (idx)}
			<p><span>{supporterName}</span> 동의합니다.</p>
		{/each}
	</section>
{/if}

<style lang="scss">
	p {
		border-bottom: solid 0.1rem var(--gray-border);
		padding: 0.4rem;
		font-size: 0.9rem;

		span {
			font-weight: 600;
		}
	}
</style>
