<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';

	import CategorySelect from './CategorySelect.svelte';
	import KindSelect from './KindSelect.svelte';

	import type { FileId, FileMeta } from '$lib/types/file-meta.type';
	import type { User } from '$lib/types/user.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';
	import DisplayTypeSelector from '$components/DisplayTypeSelector.svelte';
	import Editor from '$components/Editor.svelte';
	import FileList from '$components/FileList.svelte';
	import { createDisplayName } from '$lib/shared/utils';
	import { SubmissionCategory, SubmissionKind } from '$lib/types/submission.type.js';
	import { DisplayType } from '$lib/types/user.type';

	let { user, mode }: { user: User; mode: 'petition' | 'feedback' } = $props();

	let editorHtml = $state('');
	let loading = $state<boolean>(false);
	let attachments = $state<FileMeta[]>([]);
	let imageIds = $state<FileId[]>([]);
	let kind = $state(SubmissionKind.Inquiry);
	let category = $state(SubmissionCategory.Executive);
	let displayType = $state(DisplayType.Anonymous);

	const fileIds = $derived([...attachments.map((fileMeta) => fileMeta.id), ...imageIds]);
	const formName = $derived(mode === 'petition' ? 'createPetition' : 'createFeedback');
	const noun = $derived(mode === 'petition' ? '청원' : '문의·건의');
</script>

{#snippet MetaModule()}
	<div class="module container-col">
		{#if mode === 'petition'}
			<div class="container">
				<p class="name">{createDisplayName(user, DisplayType.RealName)}</p>
				<span class="warn-hint">(청원은 실명으로 작성됩니다.)</span>
			</div>
		{:else}
			<KindSelect bind:value={kind} />
			<CategorySelect bind:value={category} />
			<DisplayTypeSelector {user} bind:displayType />
		{/if}
		<CommonLabel labelFor="title" labelString={`${noun} 제목`}>
			<input class="title" type="text" name="title" placeholder={`${noun} 제목을 입력하세요`} />
		</CommonLabel>
	</div>
{/snippet}

{#snippet EditorModule()}
	<input type="hidden" name="content" bind:value={editorHtml} readonly />
	{#each fileIds as fileId (fileId)}
		<input type="hidden" name="fileIds" value={fileId} readonly />
	{/each}

	<Editor
		bind:attachments
		onChangeHtml={(html: string) => (editorHtml = html)}
		onChangeImageIds={(ids: FileId[]) => (imageIds = ids)}
		disabled={loading}
	/>
{/snippet}

<section class="container-col" data-loading={loading ? 'true' : 'false'}>
	<CommonForm actionName={formName} {formName} bind:loading>
		<div class="container-col submission-form">
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
		<button type="submit" class="action-btn" form={formName} disabled={loading}>
			<Pencil size="0.8rem" />
			작성
		</button>
	</div>
</section>

<style lang="scss">
	section {
		gap: 1rem;
		width: 100%;
	}

	.submission-form {
		gap: 1rem;

		& > div {
			align-items: flex-start;
		}
	}

	.name {
		font-weight: 600;
	}

	.warn-hint {
		margin-left: 0.4rem;
		color: var(--error);
		font-size: 0.8rem;
	}

	.title {
		width: 100%;
		font-size: 0.9rem;
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
