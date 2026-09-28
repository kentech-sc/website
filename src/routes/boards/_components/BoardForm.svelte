<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import X from '@lucide/svelte/icons/x';

	import type { FileId, FileMeta } from '$lib/types/file-meta.type';
	import type { Post } from '$lib/types/post.type.js';
	import type { User } from '$lib/types/user.type.js';

	import ActionForm from '$components/ActionForm.svelte';
	import AuthorNameSelector from '$components/AuthorNameSelector.svelte';
	import Editor from '$components/Editor.svelte';
	import FileList from '$components/FileList.svelte';
	import FormField from '$components/FormField.svelte';
	import { boardPostPath } from '$lib/shared/paths.js';

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

	const fileIds = $derived([...attachments.map((fileMeta) => fileMeta.id), ...imageIds]);

	$effect(() => {
		const formKey = post?.id ?? 'new';

		if (initializedFor === formKey) return;

		initializedFor = formKey;
		editorHtml = post?.content ?? '';
		attachments = fileMetas.filter((fileMeta) => !fileMeta.mime.startsWith('image/'));
		imageIds = fileMetas
			.filter((fileMeta) => fileMeta.mime.startsWith('image/'))
			.map((fileMeta) => fileMeta.id);
	});
</script>

{#snippet MetaModule()}
	<div class="module">
		<AuthorNameSelector {user} authorNameMode={post?.authorNameMode} />
		<FormField inputId="title" label="글 제목">
			<input
				id="title"
				type="text"
				name="title"
				value={post?.title}
				placeholder="제목을 입력하세요."
			/>
		</FormField>
	</div>
{/snippet}

{#snippet EditorModule()}
	<input type="hidden" name="content" bind:value={editorHtml} readonly />
	{#each fileIds as fileId (fileId)}
		<input type="hidden" name="fileIds" value={fileId} readonly />
	{/each}

	{#key post?.id ?? 'new'}
		<Editor
			initialHtml={post?.content ?? ''}
			bind:attachments
			onChangeHtml={(html: string) => (editorHtml = html)}
			onChangeImageIds={(ids: FileId[]) => (imageIds = ids)}
			disabled={loading}
		/>
	{/key}
{/snippet}

<section class="content-form" data-loading={loading ? 'true' : 'false'}>
	<ActionForm
		actionName={post ? 'editPost' : 'createPost'}
		formName={post ? 'editPost' : 'createPost'}
		bind:loading
	>
		<div class="content-form">
			{@render MetaModule()}
			{@render EditorModule()}
		</div>
	</ActionForm>

	<FileList bind:fileMetas={attachments} isEditing={true} disabled={loading} />

	<p>
		업로드는 30MB 이하의 파일만 가능합니다.<br />
		지원 확장자는 PNG, JPG(JPEG), WEBP, PDF, DOCX, XLSX 등 입니다.
	</p>

	<footer>
		{#if post}
			<a class="ui-button is-secondary" href={boardPostPath(post.boardId, post.id)}>
				<X size="0.8rem" />
				취소
			</a>
		{/if}
		<button
			type="submit"
			class="ui-button is-primary"
			form={post ? 'editPost' : 'createPost'}
			disabled={loading}
		>
			<Pencil size="0.8rem" />
			{post ? '수정' : '작성'}
		</button>
	</footer>
</section>
