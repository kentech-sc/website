<script lang="ts">
	import type { FileMeta } from '$lib/types/file-meta.type.js';

	import type { ActionResult } from '@sveltejs/kit';

	import { invalidateAll } from '$app/navigation';

	let { files }: { files: (FileMeta | null)[] } = $props();

	let filteredFiles = $derived(files.filter((file) => file !== null));

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			invalidateAll();
		}
	});
</script>

{#snippet FileItem(file: FileMeta, idx: number)}
	<div class="container file-div">
		<p><b>[{idx + 1}]</b> <a href={file.path}>{file.name}</a></p>
	</div>
{/snippet}

{#if filteredFiles.length !== 0}
	<div class="module">
		<h3>첨부파일</h3>

		{#each filteredFiles as file, idx (idx)}
			<hr />
			{@render FileItem(file, idx)}
		{/each}
	</div>
{/if}

<style lang="scss">
	.file-div {
		width: stretch;
		justify-content: space-between;
		padding: 0.25rem;
	}
</style>
