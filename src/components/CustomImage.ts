import Image from '@tiptap/extension-image';

export const CustomImage = Image.extend({
	addAttributes() {
		return {
			...this.parent?.(), // 기존 src, alt, width, height 등 유지
			fileId: {
				default: null,
				// HTML 태그로 렌더링될 때 속성 이름 (data-file-id 추천)
				renderHTML: (attributes) => {
					if (!attributes.fileId) return {};
					return { 'data-file-id': attributes.fileId };
				},
				// 저장된 HTML을 읽어올 때 속성 추출
				parseHTML: (element) => element.getAttribute('data-file-id')
			}
		};
	}
});
