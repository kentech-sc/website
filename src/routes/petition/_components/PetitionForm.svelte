<script lang="ts">
	import type { FileId, FileMeta } from '$lib/types/file-meta.type';
	import type { Post } from '$lib/types/post.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import Editor from '$components/Editor.svelte';
	import FileList from '$components/FileList.svelte';

	let { post }: { post?: Post } = $props();

	let editorHtml = $state('');
	let loading = $state<boolean>(false);
	let attachments = $state<FileMeta[]>([]);
	let imageIds = $state<FileId[]>([]);

	const fileIds = $derived([...attachments.map((fileMeta) => fileMeta._id), ...imageIds]);
</script>

<section class="module">
	<CommonForm actionName="createPetition" formName="createPetition" bind:loading>
		<div class="post-form-fields">
			<input
				class="post-form-title"
				type="text"
				name="title"
				placeholder="청원 제목을 입력하세요"
			/>

			<input type="hidden" name="content" bind:value={editorHtml} readonly />
			{#each fileIds as fileId (fileId)}
				<input type="hidden" name="fileIds" value={fileId} readonly />
			{/each}

			<Editor bind:editorHtml bind:attachments bind:imageIds initialHtml={post?.content} />
		</div>
	</CommonForm>

	<FileList bind:fileMetas={attachments} isEditing={true} />

	<p class="form-hint post-form-note">
		업로드는 30MB 이하의 파일만 가능합니다.<br />
		지원 확장자는 PNG, JPG(JPEG), WEBP, PDF, DOCX, XLSX 입니다.
	</p>

	<div class="form-actions-end">
		<button type="submit" class="btn-action" form="createPetition" disabled={loading}>작성</button>
	</div>
</section>
