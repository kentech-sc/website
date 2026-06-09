<script lang="ts">
	import '$style/nmu.scss';

	import StarterKit from '@tiptap/starter-kit';
	import { Color } from '@tiptap/extension-color';
	import { TextStyle, FontSize } from '@tiptap/extension-text-style';
	import TextAlign from '@tiptap/extension-text-align';
	import { Editor } from '@tiptap/core';

	import type { ActionResult } from '@sveltejs/kit';
	import { deserialize } from '$app/forms';
	import type { FileMeta, FileId } from '$lib/types/file-meta.type';
	import { onDestroy, onMount } from 'svelte';

	import Bold from '@lucide/svelte/icons/bold';
	import Italic from '@lucide/svelte/icons/italic';
	import Strikethrough from '@lucide/svelte/icons/strikethrough';
	import Code from '@lucide/svelte/icons/code';
	import List from '@lucide/svelte/icons/list';
	import ListOrdered from '@lucide/svelte/icons/list-ordered';
	import Code2 from '@lucide/svelte/icons/code-2';
	import Quote from '@lucide/svelte/icons/message-square-quote';
	import Minus from '@lucide/svelte/icons/minus';
	import UnderlineIcon from '@lucide/svelte/icons/underline';
	import Upload from '@lucide/svelte/icons/upload';

	import { CustomImage } from './CustomImage.js';
	import { SvelteSet } from 'svelte/reactivity';

	let element = $state<HTMLElement>();
	let real_editor = $state.raw<Editor | undefined>();
	let headingLevel = $state('');
	let fontSize = $state('16px');
	let textColor = $state('#000000');
	let textAlign = $state('left');

	let {
		attachments = $bindable<FileMeta[]>([]),
		imageIds = $bindable<FileId[]>([]),
		editorHtml = $bindable<string>(''),
		initialHtml = ''
	} = $props();

	// 파일 업로드 함수
	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = Array.from(target.files ?? []);
		if (!files.length) return;

		const formData = new FormData();
		files.forEach((f) => formData.append('files', f));

		try {
			if (files.some((f) => f.size > 1 * 1024 * 1024)) {
				alert('용량이 큰 파일은 오래 걸릴 수 있습니다.');
			}

			const res: ActionResult = deserialize(
				await (await fetch('?/uploadFile', { method: 'POST', body: formData })).text()
			);

			if (res.type === 'failure') {
				alert(`파일 업로드 실패: ${res.data!.message}`);
				return;
			} else if (res.type === 'error') {
				alert(`파일 업로드 실패: ${res.error!.message}`);
				return;
			} else if (res.type === 'redirect') {
				return;
			}

			const uploadedFileMetas = res.data!.fileMetas as FileMeta[];

			// 업로드된 파일들 처리
			for (const fileMeta of uploadedFileMetas) {
				if (fileMeta.mime.startsWith('image/')) {
					// 이미지 파일: CustomImage를 사용하여 fileId와 함께 삽입
					const imageUrl = fileMeta.path;
					if (real_editor) {
						real_editor
							.chain()
							.focus()
							.setImage({
								src: imageUrl,
								alt: fileMeta.name,
								// @ts-expect-error - fileId는 CustomImage에서 사용하는 커스텀 속성
								fileId: fileMeta._id.toString()
							})
							.run();
					}
				} else {
					// 비이미지 파일: 바로 attachments에 추가
					attachments = [...attachments, fileMeta];
				}
			}
		} catch (error) {
			console.error('파일 업로드 오류:', error);
			alert('파일 업로드에 실패했습니다.');
		}

		// input 초기화
		target.value = '';
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
		real_editor = instance;
	});

	onDestroy(() => {
		real_editor?.destroy();
	});
</script>

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
				<Bold size="1rem" />
			</button>
			<button
				type="button"
				onclick={() => editor.chain().focus().toggleItalic().run()}
				class={editor.isActive('italic') ? 'is-active' : ''}
			>
				<Italic size="1rem" />
			</button>
			<button
				type="button"
				onclick={() => editor.chain().focus().toggleStrike().run()}
				class={editor.isActive('strike') ? 'is-active' : ''}
			>
				<Strikethrough size="1rem" />
			</button>
			<button
				type="button"
				onclick={() => editor.chain().focus().toggleUnderline().run()}
				class={editor.isActive('underline') ? 'is-active' : ''}
			>
				<UnderlineIcon size="1rem" />
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
				<List size="1rem" />
			</button>
			<button
				type="button"
				onclick={() => editor.chain().focus().toggleOrderedList().run()}
				class={editor.isActive('orderedList') ? 'is-active' : ''}
			>
				<ListOrdered size="1rem" />
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
				<Code size="1rem" />
			</button>
			<button
				type="button"
				onclick={() => editor.chain().focus().toggleCodeBlock().run()}
				class={editor.isActive('codeBlock') ? 'is-active' : ''}
			>
				<Code2 size="1rem" />
			</button>
			<button
				type="button"
				onclick={() => editor.chain().focus().toggleBlockquote().run()}
				class={editor.isActive('blockquote') ? 'is-active' : ''}
			>
				<Quote size="1rem" />
			</button>
			<button type="button" onclick={() => editor.chain().focus().setHorizontalRule().run()}>
				<Minus size="1rem" />
			</button>
			<input
				type="file"
				multiple
				accept="image/*,.pdf,.docx,.xlsx"
				onchange={handleFileUpload}
				style="display: none"
				id="file-upload"
			/>
			<button type="button" onclick={() => document.getElementById('file-upload')?.click()}>
				<Upload size="1rem" />
			</button>
		</div>
	</div>
{/if}

<div class="nmu" bind:this={element}></div>

<style lang="scss">
	.nmu {
		padding: 1rem;
		border: solid 0.1rem var(--gray-border);
		position: relative;
	}

	:global(.tiptap):focus {
		outline: none;
	}

	.control-group {
		border: 0.1rem solid var(--gray-border);
		border-radius: 0.25rem;
		margin-bottom: 0.5rem;
		padding: 0.25rem;
		background: var(--gray-bg);
	}

	.button-group {
		display: flex;
		flex-wrap: wrap;
		height: auto;
		gap: 0.25rem;
		max-width: 100%;
	}

	button {
		display: flex;
		align-items: center;
		justify-content: center;
		// padding: 0.5rem;
		border: 1px solid var(--gray-border);
		border-radius: 0.25rem;
		background: var(--white);
		color: var(--text);
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			background: var(--primary-bg);
			color: var(--white);
			border-color: var(--primary-border);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		&.is-active {
			background: var(--primary-bg);
			color: var(--white);
			border-color: var(--primary-border);
		}
	}

	select {
		height: auto;
		padding: 0;
		border: 1px solid var(--gray-border);
		border-radius: 0.25rem;
		background: var(--white);
		color: var(--text);
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			border-color: var(--primary-border);
		}
	}

	input[type='color'] {
		height: auto;
		width: 2.5rem;
		border: 1px solid var(--gray-border);
		border-radius: 0.25rem;
		cursor: pointer;
		padding: 0 0.25rem;

		&:hover {
			border-color: var(--primary-border);
		}
	}
</style>
