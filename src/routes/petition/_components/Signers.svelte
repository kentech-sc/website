<script lang="ts">
	let { signersNames }: { signersNames: string[] } = $props();
</script>

<section class="container-col module">
	{#if signersNames.length === 0}
		<p>아직 서명자가 없습니다.</p>
	{:else}
		{#each signersNames as signerName, idx (idx)}
			<p><b>[{signerName}]</b> 동의합니다.</p>
		{/each}
	{/if}
</section>
