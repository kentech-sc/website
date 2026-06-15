<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';

	import type { FileId, FileMeta } from '$lib/types/file-meta.type';
	import type { Post } from '$lib/types/post.type.js';
	import type { User } from '$lib/types/user.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';
	import DisplayTypeSelector from '$components/DisplayTypeSelector.svelte';
	import Editor from '$components/Editor.svelte';
	import FileList from '$components/FileList.svelte';

	let {
		user,
		post,
		fileMetas = []
	}: { user: User; post?: Post; fileMetas?: FileMeta[] } = $props();

	let loading = $state<boolean>(false);
	let editorHtml = $state('');
	let attachments = $state<FileMeta[]>([]);
	let imageIds = $state<FileId[]>([]);
	let initializedFor = $state<string | null>(null);

	const fileIds = $derived([...attachments.map((fileMeta) => fileMeta._id), ...imageIds]);

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

{#snippet MetaModule()}
	<div class="module container-col">
		<DisplayTypeSelector {user} displayType={post?.displayType} />
		<CommonLabel labelFor="title" labelString="글 제목">
			<input type="text" name="title" value={post?.title} placeholder="제목을 입력하세요." />
		</CommonLabel>
	</div>
{/snippet}

{#snippet EditorModule()}
	<input type="hidden" name="content" bind:value={editorHtml} readonly />
	{#each fileIds as fileId (fileId)}
		<input type="hidden" name="fileIds" value={fileId} readonly />
	{/each}

	<Editor
		bind:editorHtml
		bind:attachments
		bind:imageIds
		initialHtml={post?.content}
		disabled={loading}
	/>
{/snippet}

<section class="container-col" data-loading={loading ? 'true' : 'false'}>
	<CommonForm
		actionName={post ? 'editPost' : 'createPost'}
		formName={post ? 'editPost' : 'createPost'}
		bind:loading
	>
		<div class="container-col post-form">
			{@render MetaModule()}
			{@render EditorModule()}
		</div>
	</CommonForm>

	<FileList bind:fileMetas={attachments} isEditing={true} disabled={loading} />

	<p class="file-hint">
		업로드는 30MB 이하의 파일만 가능합니다.<br />
		지원 확장자는 PNG, JPG(JPEG), WEBP, PDF, DOCX, XLSX 등 입니다.
	</p>

	<div class="action-group container">
		<button
			type="submit"
			class="action-btn"
			form={post ? 'editPost' : 'createPost'}
			disabled={loading}
		>
			<Pencil size="0.8rem" />
			{post ? '수정' : '작성'}
		</button>
	</div>
</section>

<style lang="scss">
	section {
		gap: 1rem;
		width: 100%;
	}

	.post-form {
		align-items: flex-start;
		gap: 1rem;

		& > div {
			align-items: flex-start;
			gap: 0.6rem;
		}
	}

	.file-hint {
		width: 100%;
		color: var(--gray);
		font-size: 0.7rem;
	}

	.action-group {
		justify-content: right;
		width: 100%;
	}
</style>
