<script lang="ts">
	import type { User } from '$lib/types/user.type.js';
	import type { FileMeta } from '$lib/types/file-meta.type.js';

	import type { ActionResult } from '@sveltejs/kit';

	import { invalidateAll } from '$app/navigation';

	let { files, user }: { files: FileMeta[]; user: User } = $props();

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

{#if files.length !== 0}
	<div class="module">
		<h3>첨부파일</h3>

		{#each files as file, idx (file._id)}
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
