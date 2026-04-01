<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';

	import type { Post } from '$lib/types/post.type.js';

	import type { FileMeta, FileId } from '$lib/types/file-meta.type';
	import FileList from '$components/FileList.svelte';
	import Editor from '$components/Editor.svelte';

	let { post }: { post?: Post } = $props();

	let editorHtml = $state('');

	let attachments = $state<FileMeta[]>([]);
	let imageIds = $state<FileId[]>([]);
	let fileIds = $derived([...attachments.map((fileMeta) => fileMeta._id), ...imageIds]);
</script>

<section class="module">
	<CommonForm actionName="createPetition" formName="createPetition">
		<div id="form-div">
			<input type="text" id="title" name="title" placeholder="청원 제목을 입력하세요" />

			<input class="hidden" type="text" name="content" bind:value={editorHtml} readonly />
			{#each fileIds as fileId (fileId)}
				<input class="hidden" type="text" name="fileIds" value={fileId} readonly />
			{/each}

			<Editor bind:editorHtml bind:attachments bind:imageIds initialHtml={post?.content} />
		</div>
	</CommonForm>

	<FileList bind:fileMetas={attachments} isEditing={true} />

	<p id="file-description">
		용량이 30MB 이하인 파일만 업로드 가능합니다.<br />허용 확장자: PNG, JPG(JPEG), WEBP, SVG, PDF,
		DOCX, XLSX
	</p>

	<div class="right-align">
		<button type="submit" class="btn-action" form="createPetition">작성</button>
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

		.hidden {
			display: none;
		}
	}

	#file-description {
		margin-top: 0.5rem;
		color: var(--gray-text);
		font-size: 0.75rem;
	}
</style>
