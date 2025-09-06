<script lang="ts">
	import CommonForm from '$lib/assets/commonForm.svelte';
	import type { Post } from '$lib/board/types';

	let { data } = $props();
	const post = $state<Post>(JSON.parse(data?.post || '{}'));
</script>

{#snippet HeaderModule()}
	<header class="container module">
		<h1>자유게시판</h1>
		<a href="/board">목록</a>
	</header>
{/snippet}

{#snippet NoticeModule()}
	<section class="module">
		<p>(대충 주의사항)</p>
	</section>
{/snippet}

{#snippet FormModule()}
	<section class="container module">
		<CommonForm actionName="editPost" formName="editPost">
			<div id="form-div">
				<div id="radio-div">
					<label for="anonymous">익명</label>
					<input
						type="radio"
						id="anonymous"
						name="displayType"
						value="anonymous"
						{...{ checked: post?.displayType === 'anonymous' }}
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

				<label for="title">제목</label>
				<input type="text" id="title" name="title" value={post?.title} />

				<label for="content">내용</label>
				<textarea id="content" name="content">{post?.content}</textarea>
				<button type="submit">수정</button>
			</div>
		</CommonForm>
	</section>
{/snippet}

{@render HeaderModule()}
{@render NoticeModule()}
{@render FormModule()}

<style lang="scss">
	section {
		width: stretch;
		margin: 0.5rem;
	}

	header {
		width: stretch;
		margin: 0.5rem;
		justify-content: space-between;
	}

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
