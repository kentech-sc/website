<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import X from '@lucide/svelte/icons/x';

	import CategorySelect from './CategorySelect.svelte';

	import type { FileId, FileMeta } from '$lib/types/file-meta.type';
	import type { Submission } from '$lib/types/submission.type.js';
	import type { User } from '$lib/types/user.type.js';

	import { resolve } from '$app/paths';
	import ActionForm from '$components/ActionForm.svelte';
	import AuthorNameSelector from '$components/AuthorNameSelector.svelte';
	import Editor from '$components/Editor.svelte';
	import FileList from '$components/FileList.svelte';
	import FormField from '$components/FormField.svelte';
	import { createDisplayName } from '$lib/shared/utils';
	import {
		SubmissionCategory,
		type SubmissionCategory as SubmissionCategoryType
	} from '$lib/types/submission.type.js';
	import { AuthorNameMode } from '$lib/types/user.type';

	let {
		user,
		mode,
		submission,
		fileMetas = []
	}: {
		user: User;
		mode: 'petition' | 'feedback';
		submission?: Submission;
		fileMetas?: FileMeta[];
	} = $props();

	let editorHtml = $state('');
	let loading = $state<boolean>(false);
	let attachments = $state<FileMeta[]>([]);
	let imageIds = $state<FileId[]>([]);
	let category = $state<SubmissionCategoryType>(SubmissionCategory.Executive);
	let authorNameMode = $state<AuthorNameMode>(AuthorNameMode.Anonymous);
	let initializedFor = $state<string | null>(null);

	const fileIds = $derived([...attachments.map((fileMeta) => fileMeta.id), ...imageIds]);
	const formName = $derived(
		submission
			? mode === 'petition'
				? 'editPetition'
				: 'editFeedback'
			: mode === 'petition'
				? 'createPetition'
				: 'createFeedback'
	);
	const noun = $derived(mode === 'petition' ? '청원' : '문의·건의');
	const detailHref = $derived(
		submission
			? mode === 'petition'
				? resolve('/channel/petitions/[submissionId]', { submissionId: submission.id })
				: resolve('/channel/feedback/[submissionId]', { submissionId: submission.id })
			: null
	);

	$effect(() => {
		const formKey = submission?.id ?? 'new';
		if (initializedFor === formKey) return;
		initializedFor = formKey;
		editorHtml = submission?.content ?? '';
		attachments = fileMetas.filter((file) => !file.mime.startsWith('image/'));
		imageIds = fileMetas.filter((file) => file.mime.startsWith('image/')).map((file) => file.id);
		if (submission) {
			category = submission.category ?? SubmissionCategory.Executive;
			authorNameMode = submission.authorNameMode;
		}
	});
</script>

{#snippet MetaModule()}
	<div class="module">
		{#if mode === 'petition'}
			<div class="container">
				<p class="name">{createDisplayName(user, AuthorNameMode.RealName)}</p>
				<span class="warn-hint">(청원은 실명으로 작성됩니다.)</span>
			</div>
		{:else}
			<AuthorNameSelector {user} bind:authorNameMode />
			<CategorySelect bind:value={category} />
		{/if}
		<FormField inputId="title" label={`${noun} 제목`}>
			<input
				id="title"
				type="text"
				name="title"
				value={submission?.title}
				placeholder={`${noun} 제목을 입력하세요`}
			/>
		</FormField>
	</div>
{/snippet}

{#snippet EditorModule()}
	<input type="hidden" name="content" bind:value={editorHtml} readonly />
	{#each fileIds as fileId (fileId)}
		<input type="hidden" name="fileIds" value={fileId} readonly />
	{/each}

	{#key submission?.id ?? 'new'}
		<Editor
			initialHtml={submission?.content ?? ''}
			bind:attachments
			onChangeHtml={(html: string) => (editorHtml = html)}
			onChangeImageIds={(ids: FileId[]) => (imageIds = ids)}
			disabled={loading}
		/>
	{/key}
{/snippet}

<section class="content-form" data-loading={loading ? 'true' : 'false'}>
	<ActionForm actionName={formName} {formName} bind:loading>
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
		{#if detailHref}
			<a class="ui-button is-secondary" href={detailHref}><X size="0.8rem" />취소</a>
		{/if}
		<button type="submit" class="ui-button is-primary" form={formName} disabled={loading}>
			<Pencil size="0.8rem" />
			{submission ? '수정' : '작성'}
		</button>
	</footer>
</section>

<style lang="scss">
	.name {
		font-weight: 600;
		font-size: 0.9rem;
	}
	.warn-hint {
		margin-left: 0.4rem;
		color: var(--error);
		font-size: 0.7rem;
	}
</style>
