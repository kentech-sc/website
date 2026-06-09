<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';
	import Editor from '$components/Editor.svelte';
	import FileList from '$components/FileList.svelte';

	import type { FileId, FileMeta } from '$lib/types/file-meta.type';
	import type { Post } from '$lib/types/post.type.js';

	let { post }: { post?: Post } = $props();

	let editorHtml = $state('');
	let loading = $state<boolean>(false);
	let attachments = $state<FileMeta[]>([]);
	let imageIds = $state<FileId[]>([]);

	const fileIds = $derived([...attachments.map((fileMeta) => fileMeta._id), ...imageIds]);
</script>

<section class="module">
	<CommonForm actionName="createPetition" formName="createPetition" bind:loading>
		<div id="form-div">
			<input type="text" id="title" name="title" placeholder="청원 제목을 입력하세요" />

			<input type="hidden" name="content" bind:value={editorHtml} readonly />
			{#each fileIds as fileId (fileId)}
				<input type="hidden" name="fileIds" value={fileId} readonly />
			{/each}

			<Editor bind:editorHtml bind:attachments bind:imageIds initialHtml={post?.content} />
		</div>
	</CommonForm>

	<FileList bind:fileMetas={attachments} isEditing={true} />

	<p id="file-description">
		용량이 30MB 이하인 파일만 업로드 가능합니다.<br />허용 확장자: PNG, JPG(JPEG), WEBP, PDF,
		DOCX, XLSX 등
	</p>

	<div class="form-actions">
		<button type="submit" class="btn-action" form="createPetition" disabled={loading}>작성</button>
	</div>
</section>

<style lang="scss">
	#title {
		font-size: 1rem;
	}

	#form-div {
		width: 100%;
		align-items: flex-start;

		input {
			width: 100%;
			margin-bottom: 0.5rem;
		}
	}

	#file-description {
		margin-top: 0.5rem;
		color: var(--gray-text);
		font-size: 0.75rem;
	}

	.form-actions {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
	}
</style>
