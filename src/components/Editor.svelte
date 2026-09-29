<script lang="ts">
	import '$style/nmu.scss';

	import { Editor } from '@tiptap/core';
	import { onDestroy, onMount } from 'svelte';

	import EditorToolbar from './EditorToolbar.svelte';

	import type { FileMeta, FileId } from '$lib/types/file-meta.type';
	import type { SelectionHint } from '$lib/types/general.type.js';

	import { createContentEditor, insertUploadedImages } from '$lib/client/content-editor.js';
	import { uploadFiles } from '$lib/client/file-upload.js';
	const IMAGE_INSERTION_FAILURE_MESSAGE = '이미지 업로드는 완료됐지만 본문 삽입에 실패했습니다.';
	const PASTE_IMAGE_BLOCK_MESSAGE = '이미지는 업로드 버튼으로만 추가할 수 있습니다.';

	let element = $state<HTMLElement>();
	let editorInstance = $state.raw<Editor | undefined>();
	let active = $state<Record<string, boolean>>({});
	let canToggleCode = $state(true);
	let headingLevel = $state('');
	let fontSize = $state('16px');
	let textColor = $state('#000000');
	let textAlign = $state('left');
	let uploading = $state(false);
	let editorNotice = $state<string | null>(null);
	let noticeTimer: ReturnType<typeof setTimeout> | undefined;
	let pendingImageInsertSelection = $state<SelectionHint | null>(null);

	let {
		initialHtml = '',
		attachments = $bindable<FileMeta[]>([]),
		onChangeHtml,
		onChangeImageIds,
		disabled = false
	}: {
		initialHtml?: string;
		attachments?: FileMeta[];
		onChangeHtml: (html: string) => void;
		onChangeImageIds: (ids: FileId[]) => void;
		disabled?: boolean;
	} = $props();

	$effect(() => {
		editorInstance?.setEditable(!disabled);
	});

	function showEditorNotice(message: string) {
		editorNotice = message;
		if (noticeTimer) clearTimeout(noticeTimer);
		noticeTimer = setTimeout(() => {
			editorNotice = null;
			noticeTimer = undefined;
		}, 4000);
	}

	function focusEditorFromPadding(event: PointerEvent) {
		if (disabled || event.target !== event.currentTarget) return;
		event.preventDefault();
		editorInstance?.commands.focus();
	}

	function capturePendingImageInsertSelection() {
		if (editorInstance?.isFocused) {
			const selection = editorInstance.state.selection;
			pendingImageInsertSelection = { from: selection.from, to: selection.to };
		} else {
			pendingImageInsertSelection = null;
		}
	}

	function handleUploadButtonMouseDown(event: MouseEvent) {
		if (disabled || uploading) {
			event.preventDefault();
			return;
		}

		capturePendingImageInsertSelection();
		event.preventDefault();
	}

	function prepareFileUpload(fileInput: HTMLInputElement) {
		if (disabled || uploading) return;

		capturePendingImageInsertSelection();
		fileInput.value = '';
		fileInput.click();
	}

	// 파일 업로드 함수
	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		if (disabled || uploading) {
			target.value = '';
			return;
		}

		const files = Array.from(target.files ?? []);
		if (!files.length) {
			pendingImageInsertSelection = null;
			return;
		}

		const selectionHint = pendingImageInsertSelection;
		const preferEndInsertion = selectionHint === null;
		pendingImageInsertSelection = null;

		try {
			uploading = true;

			const { uploaded: uploadedFileMetas, failedCount } = await uploadFiles(files);
			if (failedCount > 0) {
				showEditorNotice(`${failedCount}개 파일을 업로드하지 못했습니다.`);
			}
			const uploadedImageMetas = uploadedFileMetas.filter((fileMeta) =>
				fileMeta.mime.startsWith('image/')
			);
			const uploadedAttachments = uploadedFileMetas.filter(
				(fileMeta) => !fileMeta.mime.startsWith('image/')
			);

			if (uploadedAttachments.length > 0) {
				attachments = [...attachments, ...uploadedAttachments];
			}

			if (uploadedImageMetas.length === 0) {
				return;
			}

			if (!editorInstance) {
				showEditorNotice(IMAGE_INSERTION_FAILURE_MESSAGE);
				return;
			}

			const inserted = insertUploadedImages(
				editorInstance,
				uploadedImageMetas,
				selectionHint,
				preferEndInsertion
			);
			if (!inserted) {
				showEditorNotice(IMAGE_INSERTION_FAILURE_MESSAGE);
			}
		} catch (error) {
			console.error('파일 업로드 오류:', error);
			alert(error instanceof Error ? error.message : '파일 업로드에 실패했습니다.');
		} finally {
			uploading = false;
			target.value = '';
		}
	}
	onMount(() => {
		if (!element) return;
		editorInstance = createContentEditor({
			element,
			initialHtml,
			disabled,
			onChangeHtml,
			onChangeImageIds,
			onBlockedImagePaste: () => alert(PASTE_IMAGE_BLOCK_MESSAGE),
			onToolbarChange: (state) => {
				active = state.active;
				canToggleCode = state.canToggleCode;
				headingLevel = state.headingLevel;
				fontSize = state.fontSize;
				textColor = state.textColor;
				textAlign = state.textAlign;
			}
		});
	});

	onDestroy(() => {
		if (noticeTimer) clearTimeout(noticeTimer);
		editorInstance?.destroy();
	});
</script>

<section>
	{#if editorInstance}
		<EditorToolbar
			editor={editorInstance}
			{active}
			{canToggleCode}
			bind:headingLevel
			bind:fontSize
			bind:textColor
			bind:textAlign
			{disabled}
			{uploading}
			onUploadMouseDown={handleUploadButtonMouseDown}
			onUpload={prepareFileUpload}
			onFileChange={handleFileUpload}
		/>
	{/if}

	{#if editorNotice}
		<p class="editor-notice" role="alert">{editorNotice}</p>
	{/if}

	<div
		class="module input-div"
		role="group"
		aria-label="본문 편집 영역"
		onpointerdown={focusEditorFromPadding}
	>
		<div class="nmu" data-disabled={disabled ? 'true' : 'false'} bind:this={element}></div>
	</div>
</section>

<style lang="scss">
	section {
		width: 100%;
	}

	.input-div {
		display: flex;
		flex-direction: column;
		border-top: none;
		border-radius: 0 0 1.4rem 1.4rem;
		min-height: 30vh;
	}

	.input-div > .nmu {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.input-div > .nmu :global(.tiptap) {
		flex: 1;
	}

	.nmu[data-disabled='true'] {
		cursor: wait;
		background: var(--gray-bg);
	}

	:global(.tiptap):focus {
		outline: none;
	}

	.editor-notice {
		margin: 0 0 0.4rem;
		color: var(--error-text);
		font-size: 0.7rem;
	}
</style>
