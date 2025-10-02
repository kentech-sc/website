<script lang="ts">
	import CommonForm from '$lib/components/CommonForm.svelte';
	import type { Post } from '$lib/board/types';

	let { post }: { post?: Post } = $props();
</script>

{#snippet RadioModule()}
	<div id="radio-div">
		<label for="anonymous">익명</label>
		<input
			type="radio"
			id="anonymous"
			name="displayType"
			value="anonymous"
			{...{ checked: post?.displayType === 'anonymous' || !post }}
		/>
		<label for="nickname">별명</label>
		<input
			type="radio"
			id="nickname"
			name="displayType"
			value="nickname"
			{...{ checked: post?.displayType === 'nickname' }}
		/>
		<label for="realName">실명</label>
		<input
			type="radio"
			id="realName"
			name="displayType"
			value="realName"
			{...{ checked: post?.displayType === 'realName' }}
		/>
	</div>
{/snippet}

<section class="module">
	<CommonForm
		actionName={post ? 'editPost' : 'createPost'}
		formName={post ? 'editPost' : 'createPost'}
	>
		<div id="form-div">
			{@render RadioModule()}

			<label for="title">제목</label>
			<input type="text" id="title" name="title" value={post?.title} />

			<label for="content">내용</label>
			<textarea id="content" name="content">{post?.content}</textarea>
			<button type="submit">{post ? '수정' : '작성'}</button>
		</div>
	</CommonForm>
</section>

<style lang="scss">
	#radio-div {
		margin-bottom: 0.5rem;

		label {
			word-break: keep-all;
		}

		input {
			margin-left: 0.25rem;
			margin-right: 2rem;
		}
	}

	#form-div {
		width: stretch;
		align-items: flex-start;

		input:not([type='radio']),
		textarea {
			width: stretch;
			margin-bottom: 0.5rem;
		}

		textarea {
			height: 50vh;
			resize: vertical;
		}
	}
</style>
