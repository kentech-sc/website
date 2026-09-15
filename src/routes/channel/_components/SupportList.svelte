<script lang="ts">
	let { supporterNames }: { supporterNames: string[] } = $props();
</script>

{#if supporterNames.length !== 0}
	<section class="container-col module">
		{#each supporterNames as supporterName, idx (idx)}
			<p><span>{supporterName}</span> 동의합니다.</p>
		{/each}
	</section>
{/if}

<style lang="scss">
	section {
		align-items: flex-start;
		width: 100%;
	}

	p {
		border-bottom: solid 0.1rem var(--gray-border);
		padding: 0.4rem;
		width: 100%;
		font-size: 0.9rem;

		span {
			font-weight: 600;
		}
	}
</style>
