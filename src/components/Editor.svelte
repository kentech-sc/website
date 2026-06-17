<script lang="ts">
	import '$style/nmu.scss';

	import Bold from '@lucide/svelte/icons/bold';
	import Code from '@lucide/svelte/icons/code';
	import Code2 from '@lucide/svelte/icons/code-2';
	import Italic from '@lucide/svelte/icons/italic';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import Quote from '@lucide/svelte/icons/message-square-quote';
	import Minus from '@lucide/svelte/icons/minus';
	import Strikethrough from '@lucide/svelte/icons/strikethrough';
	import UnderlineIcon from '@lucide/svelte/icons/underline';
	import Upload from '@lucide/svelte/icons/upload';
	import { Editor } from '@tiptap/core';
	import { Color } from '@tiptap/extension-color';
	import TextAlign from '@tiptap/extension-text-align';
	import { TextStyle, FontSize } from '@tiptap/extension-text-style';
	import StarterKit from '@tiptap/starter-kit';
	import { onDestroy, onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	import { CustomImage } from './CustomImage.js';

	import type { FileMeta, FileId } from '$lib/types/file-meta.type';
	import type { SelectionHint } from '$lib/types/general.type.js';
	import type { ActionResult } from '@sveltejs/kit';

	import { deserialize } from '$app/forms';
	const IMAGE_INSERTION_FAILURE_MESSAGE = '이미지 업로드는 완료됐지만 본문 삽입에 실패했습니다.';
	const PASTE_IMAGE_BLOCK_MESSAGE = '이미지는 업로드 버튼으로만 추가할 수 있습니다.';

	let element = $state<HTMLElement>();
	let real_editor = $state.raw<Editor | undefined>();
	let headingLevel = $state('');
	let fontSize = $state('16px');
	let textColor = $state('#000000');
	let textAlign = $state('left');
	let uploading = $state(false);
	let editorNotice = $state<string | null>(null);
	let noticeTimer: ReturnType<typeof setTimeout> | undefined;
	let fileUploadInput = $state<HTMLInputElement>();
	let pendingImageInsertSelection = $state<SelectionHint | null>(null);

	let {
		attachments = $bindable<FileMeta[]>([]),
		imageIds = $bindable<FileId[]>([]),
		editorHtml = $bindable<string>(''),
		initialHtml = '',
		disabled = false
	} = $props();

	$effect(() => {
		real_editor?.setEditable(!disabled);
	});

	function showEditorNotice(message: string) {
		editorNotice = message;
		if (noticeTimer) clearTimeout(noticeTimer);
		noticeTimer = setTimeout(() => {
			editorNotice = null;
			noticeTimer = undefined;
		}, 4000);
	}

	function capturePendingImageInsertSelection() {
		if (real_editor?.isFocused) {
			const selection = real_editor.state.selection;
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

	function prepareFileUpload() {
		if (disabled || uploading) return;

		capturePendingImageInsertSelection();

		if (fileUploadInput) {
			fileUploadInput.value = '';
			fileUploadInput.click();
		}
	}

	function createImageAttrs(fileMeta: FileMeta) {
		return {
			src: fileMeta.path,
			alt: fileMeta.name,
			fileId: fileMeta._id.toString()
		};
	}

	function insertUploadedImages(
		editor: Editor,
		fileMetas: FileMeta[],
		selectionHint: SelectionHint | null,
		preferEndInsertion = false
	): boolean {
		if (fileMetas.length === 0) return true;

		const imageContents = fileMetas.map((fileMeta) => ({
			type: 'image',
			attrs: createImageAttrs(fileMeta)
		}));

		if (
			selectionHint &&
			editor.chain().focus().setTextSelection(selectionHint).insertContent(imageContents).run()
		) {
			return true;
		}

		if (!preferEndInsertion && editor.chain().focus().insertContent(imageContents).run()) {
			return true;
		}

		if (editor.chain().focus('end').insertContent(imageContents).run()) {
			return true;
		}

		const imageType = editor.state.schema.nodes.image;
		if (!imageType) return false;

		try {
			let insertPosition = editor.state.doc.content.size;
			let transaction = editor.state.tr;

			for (const fileMeta of fileMetas) {
				const imageNode = imageType.create(createImageAttrs(fileMeta));
				transaction = transaction.insert(insertPosition, imageNode);
				insertPosition += imageNode.nodeSize;
			}

			editor.view.dispatch(transaction.scrollIntoView());
			editor.commands.focus('end');
			return true;
		} catch (error) {
			console.error('Image insert failed:', error);
			return false;
		}
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

		const formData = new FormData();
		files.forEach((file) => formData.append('files', file));

		const selectionHint = pendingImageInsertSelection;
		const preferEndInsertion = selectionHint === null;
		pendingImageInsertSelection = null;

		try {
			uploading = true;

			if (files.some((file) => file.size > 1 * 1024 * 1024)) {
				alert('용량이 큰 파일은 오래 걸릴 수 있습니다.');
			}

			const res: ActionResult = deserialize(
				await (await fetch('?/uploadFile', { method: 'POST', body: formData })).text()
			);

			if (res.type === 'failure') {
				alert(`파일 업로드 실패: ${res.data!.message}`);
				return;
			}

			if (res.type === 'error') {
				alert(`파일 업로드 실패: ${res.error!.message}`);
				return;
			}

			if (res.type === 'redirect') {
				return;
			}

			const uploadedFileMetas = res.data!.fileMetas as FileMeta[];
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

			if (!real_editor) {
				showEditorNotice(IMAGE_INSERTION_FAILURE_MESSAGE);
				return;
			}

			const inserted = insertUploadedImages(
				real_editor,
				uploadedImageMetas,
				selectionHint,
				preferEndInsertion
			);
			if (!inserted) {
				showEditorNotice(IMAGE_INSERTION_FAILURE_MESSAGE);
			}
		} catch (error) {
			console.error('파일 업로드 오류:', error);
			alert('파일 업로드에 실패했습니다.');
		} finally {
			uploading = false;
			target.value = '';
		}
	}
	onMount(() => {
		const instance = new Editor({
			element: element,
			extensions: [
				Color.configure({ types: ['textStyle'] }),
				TextStyle.configure({}),
				TextAlign.configure({
					types: ['heading', 'paragraph'],
					alignments: ['left', 'center', 'right', 'justify']
				}),
				FontSize.configure({
					types: ['textStyle']
				}),
				CustomImage.configure({
					resize: {
						enabled: true,
						directions: ['top', 'bottom', 'left', 'right'], // can be any direction or diagonal combination
						minWidth: 50,
						minHeight: 50,
						alwaysPreserveAspectRatio: true
					}
				}),
				StarterKit
			],
			editorProps: {
				handlePaste: (_view, event) => {
					const clipboardItems = Array.from(event.clipboardData?.items ?? []);
					const hasPastedImageFile = clipboardItems.some((item) => item.type.startsWith('image/'));
					const pastedHtml = event.clipboardData?.getData('text/html') ?? '';

					if (!hasPastedImageFile && !pastedHtml) return false;

					const parsedHtml = pastedHtml
						? new DOMParser().parseFromString(pastedHtml, 'text/html')
						: null;
					const pastedImages = Array.from(parsedHtml?.querySelectorAll('img') ?? []);
					const hasBlockedHtmlImage = pastedImages.some(
						(imageElement) => !imageElement.getAttribute('data-file-id')
					);

					if (!hasPastedImageFile && !hasBlockedHtmlImage) return false;

					event.preventDefault();
					alert(PASTE_IMAGE_BLOCK_MESSAGE);
					return true;
				}
			},
			content: initialHtml,
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				real_editor = instance;

				// Update HTML content
				if (instance) {
					editorHtml = instance.getHTML();

					// 현재 에디터에 있는 이미지 ID들 추출
					const currentUsedIds = new SvelteSet<string>();

					// TipTap 내부 API를 사용하여 CustomImage의 fileId 속성 추출
					instance.state.doc.descendants((node) => {
						if (node.type.name === 'image') {
							const fileId = node.attrs.fileId;
							if (fileId) {
								currentUsedIds.add(fileId);
							}
						}
					});

					// imageIds 업데이트: 현재 사용된 이미지 ID들
					imageIds = Array.from(currentUsedIds);
				}

				// Update select values based on current cursor position
				if (instance) {
					// Update heading level
					let currentHeading = '';
					for (let level = 1; level <= 6; level++) {
						if (instance.isActive('heading', { level })) {
							currentHeading = level.toString();
							break;
						}
					}
					headingLevel = currentHeading;

					// Update font size
					const textStyleAttrs = instance.getAttributes('textStyle');
					fontSize = textStyleAttrs.fontSize || '16px';

					// Update text color
					textColor = textStyleAttrs.color || '#000000';

					// Update text align
					if (instance.isActive({ textAlign: 'center' })) {
						textAlign = 'center';
					} else if (instance.isActive({ textAlign: 'right' })) {
						textAlign = 'right';
					} else if (instance.isActive({ textAlign: 'justify' })) {
						textAlign = 'justify';
					} else {
						textAlign = 'left';
					}
				}
			}
		});
		instance.setEditable(!disabled);
		real_editor = instance;
	});

	onDestroy(() => {
		if (noticeTimer) clearTimeout(noticeTimer);
		real_editor?.destroy();
	});
</script>

<section>
	{#if real_editor}
		{@const editor = real_editor}
		<div class="control-group">
			<div class="button-group">
				<select
					bind:value={headingLevel}
					onchange={(e) => {
						const target = e.target as HTMLSelectElement;
						const level = parseInt(target.value) as 1 | 2 | 3 | 4 | 5 | 6;
						editor.chain().focus().toggleHeading({ level }).run();
					}}
				>
					<option value="">본문</option>
					<option value="1">제목 1</option>
					<option value="2">제목 2</option>
					<option value="3">제목 3</option>
					<option value="4">제목 4</option>
					<option value="5">제목 5</option>
					<option value="6">제목 6</option>
				</select>
				<button
					type="button"
					onclick={() => editor.chain().focus().toggleBold().run()}
					class={editor.isActive('bold') ? 'is-active' : ''}
				>
					<Bold size="0.8rem" />
				</button>
				<button
					type="button"
					onclick={() => editor.chain().focus().toggleItalic().run()}
					class={editor.isActive('italic') ? 'is-active' : ''}
				>
					<Italic size="0.8rem" />
				</button>
				<button
					type="button"
					onclick={() => editor.chain().focus().toggleStrike().run()}
					class={editor.isActive('strike') ? 'is-active' : ''}
				>
					<Strikethrough size="0.8rem" />
				</button>
				<button
					type="button"
					onclick={() => editor.chain().focus().toggleUnderline().run()}
					class={editor.isActive('underline') ? 'is-active' : ''}
				>
					<UnderlineIcon size="0.8rem" />
				</button>
				<select
					bind:value={fontSize}
					onchange={(e) =>
						editor
							.chain()
							.focus()
							.setFontSize((e.target as HTMLSelectElement)?.value || '16px')
							.run()}
				>
					<option value="12px">12px</option>
					<option value="14px">14px</option>
					<option value="16px">16px</option>
					<option value="18px">18px</option>
					<option value="20px">20px</option>
					<option value="24px">24px</option>
					<option value="32px">32px</option>
				</select>
				<input
					type="color"
					bind:value={textColor}
					onchange={(e) => {
						const target = e.target as HTMLInputElement;
						if (target?.value) {
							editor.chain().focus().setColor(target.value).run();
						}
					}}
					title="글자 색상 선택"
				/>
				<select
					bind:value={textAlign}
					onchange={(e) => {
						const target = e.target as HTMLSelectElement;
						editor
							.chain()
							.focus()
							.setTextAlign(target.value as string)
							.run();
					}}
				>
					<option value="left">왼쪽 정렬</option>
					<option value="center">가운데 정렬</option>
					<option value="right">오른쪽 정렬</option>
					<option value="justify">양쪽 정렬</option>
				</select>
				<button
					type="button"
					onclick={() => editor.chain().focus().toggleBulletList().run()}
					class={editor.isActive('bulletList') ? 'is-active' : ''}
				>
					<List size="0.8rem" />
				</button>
				<button
					type="button"
					onclick={() => editor.chain().focus().toggleOrderedList().run()}
					class={editor.isActive('orderedList') ? 'is-active' : ''}
				>
					<ListOrdered size="0.8rem" />
				</button>
				<!-- <button
				type="button"
				onclick={() => editor.chain().focus().setTextAlign('left').run()}
				class={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
			>
				<AlignLeft size="1rem" />
			</button>
			<button
				type="button"
				onclick={() => editor.chain().focus().setTextAlign('center').run()}
				class={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
			>
				<AlignCenter size="1rem" />
			</button>
			<button
				type="button"
				onclick={() => editor.chain().focus().setTextAlign('right').run()}
				class={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
			>
				<AlignRight size="1rem" />
			</button> -->
				<button
					type="button"
					onclick={() => editor.chain().focus().toggleCode().run()}
					disabled={!editor.can().chain().focus().toggleCode().run()}
					class={editor.isActive('code') ? 'is-active' : ''}
				>
					<Code size="0.8rem" />
				</button>
				<button
					type="button"
					onclick={() => editor.chain().focus().toggleCodeBlock().run()}
					class={editor.isActive('codeBlock') ? 'is-active' : ''}
				>
					<Code2 size="0.8rem" />
				</button>
				<button
					type="button"
					onclick={() => editor.chain().focus().toggleBlockquote().run()}
					class={editor.isActive('blockquote') ? 'is-active' : ''}
				>
					<Quote size="0.8rem" />
				</button>
				<button type="button" onclick={() => editor.chain().focus().setHorizontalRule().run()}>
					<Minus size="0.8rem" />
				</button>
				<input
					type="file"
					multiple
					accept="image/*,.pdf,.docx,.xlsx"
					bind:this={fileUploadInput}
					disabled={disabled || uploading}
					onchange={handleFileUpload}
					style="display: none"
				/>
				<button
					type="button"
					class="upload-button"
					disabled={disabled || uploading}
					onmousedown={handleUploadButtonMouseDown}
					onclick={prepareFileUpload}
				>
					<Upload size="0.8rem" />
				</button>
			</div>
		</div>
	{/if}

	{#if editorNotice}
		<p class="editor-notice" role="alert">{editorNotice}</p>
	{/if}

	<div class="module">
		<div class="nmu" data-disabled={disabled ? 'true' : 'false'} bind:this={element}></div>
	</div>
</section>

<style lang="scss">
	section {
		position: relative;
		width: 100%;
	}

	.nmu {
		margin-top: 2rem;
	}

	.nmu[data-disabled='true'] {
		cursor: wait;
		background: var(--gray-bg);
	}

	:global(.tiptap):focus {
		outline: none;
	}

	.control-group {
		position: absolute;
		left: 0;
		right: 0;
		z-index: 90;
		margin-bottom: 0.4rem;
		box-shadow: 0 0.2rem 0.4rem var(--shadow-color);
		border: 0.1rem solid var(--gray-border);
		border-radius: 0.4rem;
		background: var(--gray-bg);
		padding: 0.25rem;
	}

	.editor-notice {
		margin: 0 0 0.4rem;
		color: var(--error-text);
		font-size: 0.7rem;
	}

	.button-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem;
		max-width: 100%;
		height: auto;
	}

	button {
		display: flex;
		justify-content: center;
		align-items: center;
		transition: all 0.2s;
		cursor: pointer;
		border: 0.05rem solid var(--gray-border);
		border-radius: 0.2rem;
		background: var(--white);
		color: var(--text);

		&:hover {
			background: var(--gray-hover);
		}

		&:disabled {
			opacity: 0.5;
			cursor: wait;
		}

		&.is-active {
			background: var(--gray-bg);
		}
	}

	select {
		transition: all 0.2s;
		cursor: pointer;
		border: 0.05rem solid var(--gray-border);
		border-radius: 0.2rem;
		background: var(--white);
		padding: 0;
		height: auto;
		color: var(--text);
		font-size: 0.7rem;

		&:hover {
			border-color: var(--gray-hover);
		}
	}

	input[type='color'] {
		cursor: pointer;
		border: 0.05rem solid var(--gray-border);
		border-radius: 0.2rem;
		padding: 0 0.25rem;
		width: 2rem;
		height: auto;

		&:hover {
			border-color: var(--gray-hover);
		}
	}
</style>
