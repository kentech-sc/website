<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';

	import type { Post } from '$lib/types/post.type.js';

	import { DisplayType } from '$lib/types/user.type.js';

	import QuillEditor from '$components/QuillEditor.svelte';
	import type { FileMeta } from '$lib/types/file-meta.type';

	let { post, files = [] }: { post?: Post; files?: Array<FileMeta | null> } = $props();

	let editorHtml = $state('');
	let uploadedFileMetas = $state<FileMeta[]>(files.filter((file) => file !== null));
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

			<input type="text" id="title" name="title" value={post?.title} placeholder="제목을 입력하세요"/>

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
			
			<div class="right-align">
				<button type="submit" class="btn-action">{post ? '수정' : '작성'}</button>
			</div>
		</div>
	</CommonForm>
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
			text-align:center;
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

			&:checked + label{
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
</style>
