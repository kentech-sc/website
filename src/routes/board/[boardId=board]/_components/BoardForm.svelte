<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';

	import type { Post } from '$lib/types/post.type.js';

	import { DisplayType } from '$lib/types/user.type.js';

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

{#snippet RadioModule()}
	<div id="radio-div">
		<input
			type="radio"
			id="anonymous"
			name="displayType"
			value={DisplayType.Anonymous}
			{...{ checked: post?.displayType === DisplayType.Anonymous || !post }}
		/>
		<label for="anonymous">익명</label>
		<input
			type="radio"
			id="nickname"
			name="displayType"
			value={DisplayType.Nickname}
			{...{ checked: post?.displayType === DisplayType.Nickname }}
		/>
		<label for="nickname">별명</label>
		<input
			type="radio"
			id="realName"
			name="displayType"
			value={DisplayType.RealName}
			{...{ checked: post?.displayType === DisplayType.RealName }}
		/>
		<label for="realName">실명</label>
	</div>
{/snippet}

<section class="module">
	<CommonForm
		actionName={post ? 'editPost' : 'createPost'}
		formName={post ? 'editPost' : 'createPost'}
	>
		<div id="form-div">
			{@render RadioModule()}

			<input
				type="text"
				id="title"
				name="title"
				value={post?.title}
				placeholder="제목을 입력하세요"
			/>

			<!-- <textarea id="content" name="content">{post?.content}</textarea> -->
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
		<button type="submit" class="btn-action" form={post ? 'editPost' : 'createPost'}>
			{post ? '수정' : '작성'}
		</button>
	</div>
</section>

<style lang="scss">
	#radio-div {
		display: flex;
		width: fit-content;
		border: 1px solid var(--gray-border);
		background-color: white;
		margin-bottom: 0.5rem;

		label {
			word-break: keep-all;
			padding: 0.3rem 0.9rem;
			cursor: pointer;
			text-align: center;
			border-right: 1px solid var(--gray-border);
			transition: all 0.2s ease-in-out;

			&:last-child {
				border-right: none;
			}

			&:hover {
				background-color: var(--secondary-bg);
			}
		}

		input {
			display: none;

			&:checked + label {
				background-color: var(--secondary);
				color: var(--tertiary-text);
				font-weight: bold;
			}

			margin-left: 0.25rem;
			margin-right: 2rem;
		}
	}

	#title {
		font-size: 1rem;
	}

	#form-div {
		width: stretch;
		align-items: flex-start;

		input:not([type='radio']) {
			width: stretch;
			margin-bottom: 0.5rem;
		}

		// textarea {
		// 	height: 50vh;
		// 	resize: vertical;
		// }
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
