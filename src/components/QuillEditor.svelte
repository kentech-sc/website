<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { deserialize } from '$app/forms';

	import { onMount } from 'svelte';

	import type QuillType from 'quill';
	import 'quill/dist/quill.snow.css';

	import type { FileMeta } from '$lib/types/file-meta.type';

	let {
		initialHtml,
		editorHtml = $bindable(null),
		fileMetas = $bindable<FileMeta[]>([])
	} = $props();

	let editor = $state<HTMLElement | string>('');

	let toolbarOptions = [
		[{ header: [] }, { color: [] }, { background: [] }],
		['bold', 'italic', 'underline', 'strike'],
		[{ list: 'bullet' }, { list: 'ordered' }, { align: [] }],
		['image']
	];

	onMount(async () => {
		const { default: Quill } = await import('quill');

		let quill: QuillType = new Quill(editor, {
			modules: {
				toolbar: toolbarOptions
			},
			theme: 'snow',
			placeholder: '내용을 입력하세요.'
		});

		if (initialHtml !== undefined) {
			quill.root.innerHTML = initialHtml;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(quill.getModule('toolbar') as any).addHandler('image', function () {
			const input = document.createElement('input');
			input.type = 'file';
			input.multiple = true;
			input.accept = 'image/*,.pdf,.docx,.xlsx';

			input.onchange = async () => {
				const files = Array.from(input.files ?? []);
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
						alert(`파일 업로드 실패: ${res.data?.message}`);
						return;
					} else if (res.type === 'error') {
						alert(`파일 업로드 실패: ${res.error?.message}`);
						return;
					} else if (res.type === 'redirect') {
						return;
					}

					const uploadedFileMetas: FileMeta[] = JSON.parse(res.data?.fileMetas ?? '[]');

					const range = quill.getSelection(true);

					for (const fileMeta of uploadedFileMetas) {
						fileMetas.push(fileMeta);

						if (!fileMeta.mime.startsWith('image/')) {
							continue;
						} else {
							const imageUrl = fileMeta.path;
							quill.insertEmbed(range.index, 'image', imageUrl);
						}
					}
				} catch (error) {
					alert(error);
				}
			};

			input.click();
		});

		quill.on('text-change', () => {
			editorHtml = quill.root.innerHTML;
		});
	});
</script>

<div class="container-col" id="quill-container">
	<div id="editor" bind:this={editor}></div>
</div>

<style lang="scss">
	#quill-container {
		margin-top: 0.5rem;
		align-items: stretch;
		width: 100%;
	}

	#editor {
		width: stretch;
		min-height: 50vh;
	}
</style>
