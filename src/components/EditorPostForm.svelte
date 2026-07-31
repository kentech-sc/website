<script lang="ts">
	import type { FileId, FileMeta } from '$lib/types/file-meta.type.js';
	import type { Snippet } from 'svelte';

	import CommonForm from '$components/CommonForm.svelte';
	import Editor from '$components/Editor.svelte';
	import FileList from '$components/FileList.svelte';

	let {
		actionName,
		formName,
		submitText,
		titlePlaceholder,
		initialTitle,
		initialHtml = '',
		fileMetas = [],
		formKey,
		loading = $bindable(false),
		beforeTitle
	}: {
		actionName: string;
		formName: string;
		submitText: string;
		titlePlaceholder: string;
		initialTitle?: string;
		initialHtml?: string;
		fileMetas?: FileMeta[];
		formKey?: string;
		loading?: boolean;
		beforeTitle?: Snippet;
	} = $props();

	let editorHtml = $state('');
	let attachments = $state<FileMeta[]>([]);
	let imageIds = $state<FileId[]>([]);
	let initializedFor = $state<string | null>(null);

	const allFileIds = $derived([...attachments.map((fileMeta) => fileMeta.id), ...imageIds]);

	$effect(() => {
		const currentFormKey = formKey ?? '__default__';

		if (initializedFor === currentFormKey) return;

		initializedFor = currentFormKey;
		editorHtml = initialHtml;
		attachments = fileMetas.filter((fileMeta) => !fileMeta.mime.startsWith('image/'));
		imageIds = fileMetas
			.filter((fileMeta) => fileMeta.mime.startsWith('image/'))
			.map((fileMeta) => fileMeta.id);
	});
</script>

<section class="module" data-loading={loading ? 'true' : 'false'}>
	<CommonForm {actionName} {formName} bind:loading>
		<div>
			{#if beforeTitle}
				{@render beforeTitle()}
			{/if}

			<div>
				<input type="text" name="title" value={initialTitle ?? ''} placeholder={titlePlaceholder} />
			</div>

			<input type="hidden" name="content" bind:value={editorHtml} readonly />
			{#each allFileIds as fileId (fileId)}
				<input type="hidden" name="fileIds" value={fileId} readonly />
			{/each}

			{#key formKey ?? '__default__'}
				<Editor
					{initialHtml}
					bind:attachments
					onChangeHtml={(html: string) => (editorHtml = html)}
					onChangeImageIds={(ids: FileId[]) => (imageIds = ids)}
					disabled={loading}
				/>
			{/key}
		</div>
	</CommonForm>

	<FileList bind:fileMetas={attachments} isEditing={true} disabled={loading} />

	<p>
		첨부는 30MB 이하의 파일만 업로드 가능합니다.<br />
		허용 확장자: PNG, JPG(JPEG), WEBP, PDF, DOCX, XLSX
	</p>

	<div>
		<button type="submit" class="action-btn" form={formName} disabled={loading}>{submitText}</button
		>
	</div>
</section>
