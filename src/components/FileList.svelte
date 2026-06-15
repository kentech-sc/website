<script lang="ts">
	import Trash_2 from '@lucide/svelte/icons/trash-2';

	import type { FileId, FileMeta } from '$lib/types/file-meta.type.js';

	let {
		fileMetas = $bindable([]),
		isEditing,
		disabled = false
	}: {
		fileMetas: FileMeta[];
		isEditing: boolean;
		disabled?: boolean;
	} = $props();

	let filteredFiles = $derived<FileMeta[]>(
		fileMetas.filter((fileMeta) =>
			['pdf', 'txt', 'md', 'json', 'csv', 'yml', 'yaml', 'docx', 'xlsx', 'pptx'].includes(
				fileMeta.ext
			)
		)
	);

	const deleteFile = (fileId: FileId) => {
		if (disabled) return;

		fileMetas = fileMetas.filter((fileMeta: FileMeta) => fileMeta._id !== fileId);
	};
</script>

{#snippet FileItem(file: FileMeta, idx: number)}
	<div class="container file-item">
		<p>[{idx + 1}] <a href={file.path}>{file.name}</a></p>
		{#if isEditing}
			<button onclick={() => deleteFile(file._id)} {disabled}><Trash_2 size="0.8rem" /></button>
		{/if}
	</div>
{/snippet}

{#if filteredFiles.length !== 0}
	<div class="file-div module" data-disabled={disabled ? 'true' : 'false'}>
		<h3>첨부파일</h3>

		{#each filteredFiles as file, idx (idx)}
			{@render FileItem(file, idx)}
		{/each}
	</div>
{/if}

<style lang="scss">
	.file-div {
		padding: 0.8rem 1rem;
	}

	.file-div[data-disabled='true'] {
		opacity: 0.7;
		cursor: wait;
		pointer-events: none;
	}

	h3 {
		margin-bottom: 0.4rem;
		border-bottom: 0.1rem solid var(--gray-border);
		font-weight: 600;
		font-size: 1rem;
	}

	.file-item {
		justify-content: space-between;

		button {
			border: none;
			padding: 0rem 0.2rem;
			color: var(--error);
		}

		p {
			font-size: 0.8rem;
		}
	}
</style>
