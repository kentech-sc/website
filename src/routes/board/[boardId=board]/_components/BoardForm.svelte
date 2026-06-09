<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';
	import Editor from '$components/Editor.svelte';
	import FileList from '$components/FileList.svelte';

	import type { FileId, FileMeta } from '$lib/types/file-meta.type';
	import type { Post } from '$lib/types/post.type.js';
	import { DisplayType } from '$lib/types/user.type.js';

	let { post, fileMetas = [] }: { post?: Post; fileMetas?: FileMeta[] } = $props();

	let loading = $state<boolean>(false);
	let editorHtml = $state('');
	let attachments = $state<FileMeta[]>([]);
	let imageIds = $state<FileId[]>([]);
	let initializedFor = $state<string | null>(null);

	const allFileIds = $derived([...attachments.map((fileMeta) => fileMeta._id), ...imageIds]);

	$effect(() => {
		const formKey = post?._id ?? 'new';

		if (initializedFor === formKey) return;

		initializedFor = formKey;
		editorHtml = post?.content ?? '';
		attachments = fileMetas.filter((fileMeta) => !fileMeta.mime.startsWith('image/'));
		imageIds = fileMetas
			.filter((fileMeta) => fileMeta.mime.startsWith('image/'))
			.map((fileMeta) => fileMeta._id);
	});
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

			<input type="hidden" name="content" bind:value={editorHtml} readonly />
			{#each allFileIds as fileId (fileId)}
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
		<button
			type="submit"
			class="btn-action"
			form={post ? 'editPost' : 'createPost'}
			disabled={loading}
		>
			{post ? '수정' : '작성'}
		</button>
	</div>
</section>

<style lang="scss">
	#radio-div {
		display: flex;
		width: fit-content;
		border: 0.1rem solid var(--gray-border);
		background-color: var(--surface-base);
		margin-bottom: 0.5rem;

		label {
			word-break: keep-all;
			padding: 0.3rem 0.9rem;
			cursor: pointer;
			text-align: center;
			border-right: 0.1rem solid var(--gray-border);
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
			margin-left: 0.25rem;
			margin-right: 2rem;

			&:checked + label {
				background-color: var(--secondary);
				color: var(--tertiary-text);
				font-weight: bold;
			}
		}
	}

	#title {
		font-size: 1rem;
	}

	#form-div {
		width: 100%;
		align-items: flex-start;

		input:not([type='radio']) {
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
