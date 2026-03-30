<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';

	import type { Post } from '$lib/types/post.type.js';

	import QuillEditor from '$components/QuillEditor.svelte';
	import type { FileMeta } from '$lib/types/file-meta.type';

	import type { ActionResult } from '@sveltejs/kit';
	import { Types } from 'mongoose';

	let { post, files = [] }: { post?: Post; files?: Array<FileMeta | null> } = $props();

	let editorHtml = $state('');
	let uploadedFileMetas = $state<FileMeta[]>(files.filter((file) => file !== null));

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			const deletedFileMeta = JSON.parse(formResult.data?.deletedFileMeta ?? '{}');
			uploadedFileMetas = uploadedFileMetas.filter(
				(fileMeta: FileMeta) => !new Types.ObjectId(fileMeta._id).equals(deletedFileMeta._id)
			);
			formResult = null;
			alert('성공적으로 파일을 삭제했습니다.');
		}
	});
</script>

<section class="module">
	<CommonForm actionName="createPetition" formName="createPetition">
		<div id="form-div">
			<input type="text" id="title" name="title" placeholder="청원 제목을 입력하세요" />

			<input class="hidden" type="text" name="content" bind:value={editorHtml} readonly />
			{#each uploadedFileMetas as fileMeta (fileMeta._id)}
				<input
					class="hidden"
					type="text"
					name="fileMetas"
					value={JSON.stringify(fileMeta)}
					readonly
				/>
			{/each}

			<QuillEditor bind:editorHtml bind:uploadedFileMetas initialHtml={post?.content} />
		</div>
	</CommonForm>

	{#each uploadedFileMetas as fileMeta, i (fileMeta._id)}
		<CommonForm formName="delete-file-form-{i}" actionName="deleteFile" bind:formResult>
			<div class="container file-delete-div">
				<input type="text" name="fileId" class="hidden" readonly value={fileMeta._id} />
				<p><b>[{i + 1}]</b> {fileMeta.name}</p>
				<button type="submit">X</button>
			</div>
		</CommonForm>
	{/each}

	<p id="file-description">
		용량이 30MB 이하인 파일만 업로드 가능합니다.<br />허용 확장자: PNG, JPG(JPEG), WEBP, SVG, PDF,
		DOCX, XLSX
	</p>

	<div class="right-align">
		<button type="submit" class="btn-action" form="createPetition">작성</button>
	</div>
</section>

<style lang="scss">
	#title {
		font-size: 1rem;
	}

	#form-div {
		width: 100%;
		align-items: flex-start;

		input {
			width: 100%;
			margin-bottom: 0.5rem;
		}

		.hidden {
			display: none;
		}
	}

	#file-description {
		margin-top: 0.5rem;
		color: var(--gray-text);
		font-size: 0.75rem;
	}

	.file-delete-div {
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
