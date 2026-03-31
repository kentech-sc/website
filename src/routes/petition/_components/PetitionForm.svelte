<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';

	import type { Post } from '$lib/types/post.type.js';

	import QuillEditor from '$components/QuillEditor.svelte';
	import type { FileMeta } from '$lib/types/file-meta.type';
	import FileList from '$components/FileList.svelte';


	let { post }: { post?: Post; } = $props();

	let editorHtml = $state('');
	let fileMetas = $state<FileMeta[]>([]);

</script>

<section class="module">
	<CommonForm actionName="createPetition" formName="createPetition">
		<div id="form-div">
			<input type="text" id="title" name="title" placeholder="청원 제목을 입력하세요" />

			<input class="hidden" type="text" name="content" bind:value={editorHtml} readonly />
			{#each fileMetas as fileMeta (fileMeta._id)}
				<input
					class="hidden"
					type="text"
					name="fileMetas"
					value={JSON.stringify(fileMeta)}
					readonly
				/>
			{/each}

			<QuillEditor bind:editorHtml bind:fileMetas initialHtml={post?.content} />
		</div>
	</CommonForm>

	<FileList {fileMetas} isEditing={true} />

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
