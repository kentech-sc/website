import { ResizableNodeView } from '@tiptap/core';
import Image from '@tiptap/extension-image';

type ImageAttrs = {
	src?: string | null;
	alt?: string | null;
	title?: string | null;
	width?: number | null;
	height?: number | null;
	fileId?: string | null;
};

function syncImageElementAttributes(element: HTMLImageElement, attrs: ImageAttrs) {
	if (attrs.src) {
		element.src = attrs.src;
	} else {
		element.removeAttribute('src');
	}

	if (attrs.alt !== null && attrs.alt !== undefined) {
		element.setAttribute('alt', attrs.alt);
	} else {
		element.removeAttribute('alt');
	}

	if (attrs.title !== null && attrs.title !== undefined) {
		element.setAttribute('title', attrs.title);
	} else {
		element.removeAttribute('title');
	}

	if (attrs.fileId) {
		element.setAttribute('data-file-id', attrs.fileId);
	} else {
		element.removeAttribute('data-file-id');
	}

	if (attrs.width !== null && attrs.width !== undefined) {
		element.style.width = `${attrs.width}px`;
	} else {
		element.style.removeProperty('width');
	}

	if (attrs.height !== null && attrs.height !== undefined) {
		element.style.height = `${attrs.height}px`;
	} else {
		element.style.removeProperty('height');
	}
}

export const CustomImage = Image.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			fileId: {
				default: null,
				renderHTML: (attributes) => {
					if (!attributes.fileId) return {};
					return { 'data-file-id': attributes.fileId };
				},
				parseHTML: (element) => element.getAttribute('data-file-id')
			}
		};
	},

	addNodeView() {
		if (!this.options.resize || !this.options.resize.enabled || typeof document === 'undefined') {
			return this.parent?.() ?? null;
		}

		const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } = this.options.resize;

		return ({ node, getPos, HTMLAttributes, editor }) => {
			const element = document.createElement('img');

			Object.entries(HTMLAttributes).forEach(([key, value]) => {
				if (value == null || key === 'width' || key === 'height') return;
				element.setAttribute(key, String(value));
			});

			syncImageElementAttributes(element, node.attrs as ImageAttrs);

			return new ResizableNodeView({
				element,
				editor,
				node,
				getPos,
				onResize: (width, height) => {
					element.style.width = `${width}px`;
					element.style.height = `${height}px`;
				},
				onCommit: (width, height) => {
					const pos = getPos();
					if (pos === undefined) return;

					this.editor
						.chain()
						.setNodeSelection(pos)
						.updateAttributes(this.name, { width, height })
						.run();
				},
				onUpdate: (updatedNode) => {
					syncImageElementAttributes(element, updatedNode.attrs as ImageAttrs);
					return true;
				},
				options: {
					directions,
					min: {
						width: minWidth,
						height: minHeight
					},
					preserveAspectRatio: alwaysPreserveAspectRatio === true
				}
			});
		};
	}
});
