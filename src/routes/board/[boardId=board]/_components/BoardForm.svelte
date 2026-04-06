<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';

	import type { Post } from '$lib/types/post.type.js';

	import { DisplayType } from '$lib/types/user.type.js';

	import type { FileId, FileMeta } from '$lib/types/file-meta.type';
	import FileList from '$components/FileList.svelte';
	import Editor from '$components/Editor.svelte';

	let { post, fileMetas = [] }: { post?: Post; fileMetas?: FileMeta[] } = $props();

	let loading = $state<boolean>(false);

	let editorHtml = $state('');
	let attachments = $state<FileMeta[]>(
		fileMetas.filter((fileMeta) => !fileMeta.mime.startsWith('image/'))
	);
	let imageIds = $state<FileId[]>(
		fileMetas
			.filter((fileMeta) => fileMeta.mime.startsWith('image/'))
			.map((fileMeta) => fileMeta._id)
	);
	let allFileIds = $derived([...attachments.map((fileMeta) => fileMeta._id), ...imageIds]);
</script>

{#snippet RadioModule()}
	<div id="radio-div">
		<input
			type="radio"
			id="anonymous"
			name="displayType"
			value={DisplayType.Anonymous}
			{...{ checked: post?.displayType === DisplayType.Anonymous || !post }}
		/>
		<label for="anonymous">익명</label>
		<input
			type="radio"
			id="nickname"
			name="displayType"
			value={DisplayType.Nickname}
			{...{ checked: post?.displayType === DisplayType.Nickname }}
		/>
		<label for="nickname">별명</label>
		<input
			type="radio"
			id="realName"
			name="displayType"
			value={DisplayType.RealName}
			{...{ checked: post?.displayType === DisplayType.RealName }}
		/>
		<label for="realName">실명</label>
	</div>
{/snippet}

<section class="module">
	<CommonForm
		actionName={post ? 'editPost' : 'createPost'}
		formName={post ? 'editPost' : 'createPost'}
		bind:loading
	>
		<div id="form-div">
			{@render RadioModule()}

			<input
				type="text"
				id="title"
				name="title"
				value={post?.title}
				placeholder="제목을 입력하세요"
			/>

			<!-- <textarea id="content" name="content">{post?.content}</textarea> -->
			<input class="hidden" type="text" name="content" bind:value={editorHtml} readonly />
			{#each allFileIds as fileId (fileId)}
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
		<button type="submit" class="btn-action" form={post ? 'editPost' : 'createPost'} disabled={loading}>
			{post ? '수정' : '작성'}
		</button>
	</div>
</section>

<style lang="scss">
	#radio-div {
		display: flex;
		width: fit-content;
		border: 1px solid var(--gray-border);
		background-color: white;
		margin-bottom: 0.5rem;

		label {
			word-break: keep-all;
			padding: 0.3rem 0.9rem;
			cursor: pointer;
			text-align: center;
			border-right: 1px solid var(--gray-border);
			transition: all 0.2s ease-in-out;

			&:last-child {
				border-right: none;
			}

			&:hover {
				background-color: var(--secondary-bg);
			}
		}

		input {
			display: none;

			&:checked + label {
				background-color: var(--secondary);
				color: var(--tertiary-text);
				font-weight: bold;
			}

			margin-left: 0.25rem;
			margin-right: 2rem;
		}
	}

	#title {
		font-size: 1rem;
	}

	#form-div {
		width: stretch;
		align-items: flex-start;

		input:not([type='radio']) {
			width: stretch;
			margin-bottom: 0.5rem;
		}

		// textarea {
		// 	height: 50vh;
		// 	resize: vertical;
		// }
	}

	#file-description {
		margin-top: 0.5rem;
		color: var(--gray-text);
		font-size: 0.75rem;
	}
</style>
