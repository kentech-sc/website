<script lang="ts">
	import { Types } from 'mongoose';
	import { SvelteSet } from 'svelte/reactivity';

	import type { FileId, FileMeta } from '$lib/types/file-meta.type.js';

	let { fileMetas = $bindable([]), isEditing }: { fileMetas: FileMeta[]; isEditing: boolean } =
		$props();

	let filteredFiles = $derived<FileMeta[]>(
		fileMetas.filter((fileMeta) => ['pdf', 'docx', 'xlsx'].includes(fileMeta.ext))
	);

	const deleteFile = (fileId: FileId) => {
		fileMetas = fileMetas.filter(
			(fileMeta: FileMeta) => !new Types.ObjectId(fileMeta._id).equals(fileId)
		);
	};

	const openPreviews = new SvelteSet<string>();

	const togglePreview = (fileId: FileId) => {
		const key = fileId.toString();
		if (openPreviews.has(key)) openPreviews.delete(key);
		else openPreviews.add(key);
	};
</script>

{#snippet FileItem(file: FileMeta, idx: number)}
	<div class="container file-div">
		<p><b>[{idx + 1}]</b> <a href={file.path}>{file.name}</a></p>
		<div class="file-actions">
			{#if !isEditing && file.ext === 'pdf'}
				<button class="preview-btn" onclick={() => togglePreview(file._id)}>
					{openPreviews.has(file._id.toString()) ? '미리보기 닫기' : '미리보기'}
				</button>
			{/if}
			{#if isEditing}
				<button class="delete-btn" onclick={() => deleteFile(file._id)}>X</button>
			{/if}
		</div>
	</div>
	{#if !isEditing && file.ext === 'pdf' && openPreviews.has(file._id.toString())}
		<iframe src={file.path} title={file.name} class="pdf-viewer"></iframe>
	{/if}
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

		.file-actions {
			display: flex;
			gap: 0.5rem;
			align-items: center;
			flex-shrink: 0;
		}

		.preview-btn {
			padding: 0.1rem 0.5rem;
			font-size: 0.8rem;
			border: solid 0.05rem var(--gray-border);
			border-radius: 0.3rem;
			background: transparent;
			color: var(--secondary);
			cursor: pointer;

			&:hover {
				background-color: var(--secondary-bg);
			}
		}

		.delete-btn {
			padding: 0;
			padding-right: 0.5rem;
			color: red;
			border: none;
			background: transparent;
		}
	}

	.pdf-viewer {
		width: 100%;
		height: 600px;
		border: solid 0.05rem var(--gray-border);
		border-radius: 0.3rem;
		margin-top: 0.25rem;
	}
</style>
