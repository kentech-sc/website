<script lang="ts">
	import type { FileId, FileMeta } from '$lib/types/file-meta.type';
	import type { Post } from '$lib/types/post.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import Editor from '$components/Editor.svelte';
	import FileList from '$components/FileList.svelte';
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

{#snippet DisplayTypePicker()}
	<div class="display-type-group">
		<input
			class="display-type-input"
			type="radio"
			id="anonymous"
			name="displayType"
			value={DisplayType.Anonymous}
			{...{ checked: post?.displayType === DisplayType.Anonymous || !post }}
		/>
		<label class="display-type-label" for="anonymous">익명</label>
		<input
			class="display-type-input"
			type="radio"
			id="nickname"
			name="displayType"
			value={DisplayType.Nickname}
			{...{ checked: post?.displayType === DisplayType.Nickname }}
		/>
		<label class="display-type-label" for="nickname">별명</label>
		<input
			class="display-type-input"
			type="radio"
			id="realName"
			name="displayType"
			value={DisplayType.RealName}
			{...{ checked: post?.displayType === DisplayType.RealName }}
		/>
		<label class="display-type-label" for="realName">실명</label>
	</div>
{/snippet}

<section class="module">
	<CommonForm
		actionName={post ? 'editPost' : 'createPost'}
		formName={post ? 'editPost' : 'createPost'}
		bind:loading
	>
		<div class="post-form-fields">
			{@render DisplayTypePicker()}

			<input
				class="post-form-title"
				type="text"
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

	<p class="form-hint post-form-note">
		업로드는 30MB 이하의 파일만 가능합니다.<br />
		지원 확장자는 PNG, JPG(JPEG), WEBP, PDF, DOCX, XLSX 입니다.
	</p>

	<div class="form-actions-end">
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
	.display-type-group {
		display: flex;
		width: fit-content;
		border: 0.1rem solid var(--gray-border);
		background-color: var(--surface-base);
	}

	.display-type-input {
		display: none;
	}

	.display-type-label {
		word-break: keep-all;
		padding: 0.4rem 1rem;
		cursor: pointer;
		text-align: center;
		border-right: 0.1rem solid var(--gray-border);
		transition: all 0.2s ease-in-out;
	}

	.display-type-label:last-child {
		border-right: none;
	}

	.display-type-label:hover {
		background-color: var(--secondary-bg);
	}

	.display-type-input:checked + .display-type-label {
		background-color: var(--secondary);
		color: var(--tertiary-text);
		font-weight: bold;
	}
</style>
