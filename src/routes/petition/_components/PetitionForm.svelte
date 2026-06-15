<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';

	import type { FileId, FileMeta } from '$lib/types/file-meta.type';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';
	import Editor from '$components/Editor.svelte';
	import FileList from '$components/FileList.svelte';
	import { createDisplayName } from '$lib/shared/utils';
	import { DisplayType, type User } from '$lib/types/user.type';

	let { user }: { user: User } = $props();

	let editorHtml = $state('');
	let loading = $state<boolean>(false);
	let attachments = $state<FileMeta[]>([]);
	let imageIds = $state<FileId[]>([]);

	const fileIds = $derived([...attachments.map((fileMeta) => fileMeta._id), ...imageIds]);
</script>

{#snippet MetaModule()}
	<div class="module container-col">
		<div class="container">
			<p class="name">{createDisplayName(user, DisplayType.RealName)}</p>
			<span class="warn-hint">(청원은 실명으로 작성됩니다.)</span>
		</div>
		<CommonLabel labelFor="title" labelString="청원 제목">
			<input class="title" type="text" name="title" placeholder="청원 제목을 입력하세요" />
		</CommonLabel>
	</div>
{/snippet}

{#snippet EditorModule()}
	<input type="hidden" name="content" bind:value={editorHtml} readonly />
	{#each fileIds as fileId (fileId)}
		<input type="hidden" name="fileIds" value={fileId} readonly />
	{/each}

	<Editor bind:editorHtml bind:attachments bind:imageIds disabled={loading} />
{/snippet}

<section class="container-col" data-loading={loading ? 'true' : 'false'}>
	<CommonForm actionName="createPetition" formName="createPetition" bind:loading>
		<div class="container-col petition-form">
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
		<button type="submit" class="action-btn" form="createPetition" disabled={loading}>
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

	.petition-form {
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
