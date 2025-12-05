<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import { Types } from 'mongoose';

	import { onMount } from 'svelte';

	import type QuillType from 'quill';
	import 'quill/dist/quill.snow.css';

	import type { FileMeta } from '$lib/types/file-meta.type';
	import CommonForm from '$components/CommonForm.svelte';

	let {
		initialHtml,
		editorHtml = $bindable(null),
		uploadedFileMetas = $bindable<FileMeta[]>([])
	} = $props();

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			const deletedFileMeta = JSON.parse(formResult.data?.deletedFileMeta ?? '{}');
			uploadedFileMetas = uploadedFileMetas.filter(
				(fileMeta: FileMeta) => !new Types.ObjectId(fileMeta._id).equals(deletedFileMeta._id)
			);
			formResult = null;
		}
	});

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

		if (!!initialHtml) {
			quill.root.innerHTML = initialHtml;
		}

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

				const res = await fetch('?/uploadFile', { method: 'POST', body: formData });

				const data = JSON.parse((await res.json()).data);
				const fileMetas: FileMeta[] = JSON.parse(data[0]);

				const range = quill.getSelection(true);

				for (const fileMeta of fileMetas) {
					uploadedFileMetas.push(fileMeta);
					if (!fileMeta.mime.startsWith('image/')) continue;
					const imageUrl = fileMeta.path;
					quill.insertEmbed(range.index, 'image', imageUrl);
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

	{#each uploadedFileMetas as fileMeta, i (fileMeta._id)}
		<CommonForm formName="delete-file-form-{i}" actionName="deleteFile" bind:formResult>
			<div class="container" id="form-div">
				<input type="text" name="fileId" class="hidden" readonly value={fileMeta._id} />
				<p><b>[{i + 1}]</b> {fileMeta.name}</p>
				<button type="submit">X</button>
			</div>
		</CommonForm>
	{/each}
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

	#form-div {
		justify-content: flex-start;
		background-color: var(--gray-bg);
		border-bottom: solid 0.1rem var(--gray);

		button {
			color: red;
			border: none;
			background: transparent;
		}
	}
</style>
