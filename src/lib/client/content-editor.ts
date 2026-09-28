import { Editor } from '@tiptap/core';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { FontSize, TextStyle } from '@tiptap/extension-text-style';
import StarterKit from '@tiptap/starter-kit';

import type { FileMeta } from '$lib/types/file-meta.type.js';
import type { SelectionHint } from '$lib/types/general.type.js';

import { CustomImage } from '$components/CustomImage.js';

export type EditorToolbarState = {
	active: Record<string, boolean>;
	canToggleCode: boolean;
	headingLevel: string;
	fontSize: string;
	textColor: string;
	textAlign: string;
};

function imageAttributes(file: FileMeta) {
	return { src: file.path, alt: file.name, fileId: file.id.toString() };
}

export function insertUploadedImages(
	editor: Editor,
	files: FileMeta[],
	selection: SelectionHint | null,
	preferEnd = false
): boolean {
	if (!files.length) return true;
	const content = files.map((file) => ({ type: 'image', attrs: imageAttributes(file) }));
	if (
		selection &&
		editor.chain().focus().setTextSelection(selection).insertContent(content).run()
	) {
		return true;
	}
	if (!preferEnd && editor.chain().focus().insertContent(content).run()) return true;
	if (editor.chain().focus('end').insertContent(content).run()) return true;

	const imageType = editor.state.schema.nodes.image;
	if (!imageType) return false;
	try {
		let position = editor.state.doc.content.size;
		let transaction = editor.state.tr;
		for (const file of files) {
			const node = imageType.create(imageAttributes(file));
			transaction = transaction.insert(position, node);
			position += node.nodeSize;
		}
		editor.view.dispatch(transaction.scrollIntoView());
		editor.commands.focus('end');
		return true;
	} catch (error) {
		console.error('Image insert failed:', error);
		return false;
	}
}

export function createContentEditor(options: {
	element: HTMLElement;
	initialHtml: string;
	disabled: boolean;
	onChangeHtml: (html: string) => void;
	onChangeImageIds: (ids: string[]) => void;
	onToolbarChange: (state: EditorToolbarState) => void;
	onBlockedImagePaste: () => void;
}): Editor {
	function publishState(editor: Editor) {
		options.onChangeHtml(editor.getHTML());
		const imageIds = new Set<string>();
		editor.state.doc.descendants((node) => {
			if (node.type.name === 'image' && node.attrs.fileId) imageIds.add(node.attrs.fileId);
		});
		options.onChangeImageIds([...imageIds]);

		let headingLevel = '';
		for (let level = 1; level <= 6; level++) {
			if (editor.isActive('heading', { level })) {
				headingLevel = String(level);
				break;
			}
		}
		const textStyle = editor.getAttributes('textStyle');
		const textAlign = ['center', 'right', 'justify'].find((align) =>
			editor.isActive({ textAlign: align })
		);
		options.onToolbarChange({
			active: Object.fromEntries(
				[
					'bold',
					'italic',
					'strike',
					'underline',
					'bulletList',
					'orderedList',
					'code',
					'codeBlock',
					'blockquote'
				].map((name) => [name, editor.isActive(name)])
			),
			canToggleCode: editor.can().toggleCode(),
			headingLevel,
			fontSize: textStyle.fontSize || '16px',
			textColor: textStyle.color || '#000000',
			textAlign: textAlign ?? 'left'
		});
	}
	const editor = new Editor({
		element: options.element,
		extensions: [
			Color.configure({ types: ['textStyle'] }),
			TextStyle.configure({}),
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
			FontSize.configure({ types: ['textStyle'] }),
			CustomImage.configure({
				resize: {
					enabled: true,
					directions: ['top', 'bottom', 'left', 'right'],
					minWidth: 50,
					minHeight: 50,
					alwaysPreserveAspectRatio: true
				}
			}),
			StarterKit
		],
		editorProps: {
			handlePaste: (_view, event) => {
				const items = Array.from(event.clipboardData?.items ?? []);
				const hasImageFile = items.some((item) => item.type.startsWith('image/'));
				const html = event.clipboardData?.getData('text/html') ?? '';
				if (!hasImageFile && !html) return false;
				const document = html ? new DOMParser().parseFromString(html, 'text/html') : null;
				const hasExternalImage = Array.from(document?.querySelectorAll('img') ?? []).some(
					(image) => !image.getAttribute('data-file-id')
				);
				if (!hasImageFile && !hasExternalImage) return false;
				event.preventDefault();
				options.onBlockedImagePaste();
				return true;
			}
		},
		content: options.initialHtml,
		onCreate: ({ editor }) => publishState(editor),
		onTransaction: ({ editor }) => publishState(editor)
	});
	editor.setEditable(!options.disabled);
	return editor;
}
