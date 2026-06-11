<script lang="ts">
	import type { FileId, FileMeta } from '$lib/types/file-meta.type.js';

	let { fileMetas = $bindable([]), isEditing }: { fileMetas: FileMeta[]; isEditing: boolean } =
		$props();

	let filteredFiles = $derived<FileMeta[]>(
		fileMetas.filter((fileMeta) => ['pdf', 'docx', 'xlsx'].includes(fileMeta.ext))
	);

	const deleteFile = (fileId: FileId) => {
		fileMetas = fileMetas.filter((fileMeta: FileMeta) => fileMeta._id !== fileId);
	};
</script>

{#snippet FileItem(file: FileMeta, idx: number)}
	<div class="container file-div">
		<p><b>[{idx + 1}]</b> <a href={file.path}>{file.name}</a></p>
		{#if isEditing}
			<button onclick={() => deleteFile(file._id)}>X</button>
		{/if}
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
		width: 100%;
		justify-content: space-between;
		padding: 0.25rem;

		button {
			padding: 0;
			padding-right: 0.4rem;
			color: red;
			border: none;
			background: transparent;
		}
	}
</style>
