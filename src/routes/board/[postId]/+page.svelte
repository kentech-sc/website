<script lang="ts">
	import { page } from '$app/state';
	import type { ActionResult } from '@sveltejs/kit';
	import type { Comment, Post } from '$lib/board/types.js';
	import GeneralUtils from '$lib/general/utils.js';

	import Heart from '@lucide/svelte/icons/heart';
	import CommonForm from '$lib/assets/commonForm.svelte';
	import { invalidateAll } from '$app/navigation';
	import UserService from '$lib/user/service.js';

	const user = JSON.parse(page.data.user);

	let { data } = $props();

	let post = $state<Post>(JSON.parse(data?.post || '{}'));
	let comments = $derived<Comment[]>(JSON.parse(data?.comments || '[]'));

	let likeFormResult = $state<ActionResult | null>(null);
	let commentFormResult = $state<ActionResult | null>(null);
	let commentTextarea = $state<HTMLTextAreaElement | null>(null);

	let displayType = $state<'anonymous' | 'nickname' | 'realName'>('anonymous');

	$effect(() => {
		if (likeFormResult?.type === 'success') {
			const updatedPost = JSON.parse(likeFormResult.data?.post ?? '{}');
			if (updatedPost.likeCnt > post.likeCnt) {
				post.likedBy.push(user._id);
			} else if (updatedPost.likeCnt < post.likeCnt) {
				post.likedBy = post.likedBy.filter((id) => id.toString() !== user._id.toString());
			}
			post.likeCnt = updatedPost.likeCnt;
		}

		if (commentFormResult?.type === 'success') {
			if (commentFormResult.data?.comment && commentTextarea) {
				commentTextarea.value = '';
			}
			invalidateAll();
			// const data = commentFormResult.data;
			// if (data?.comment) {
			// 	comments.push(JSON.parse(data?.comment ?? '{}'));
			// } else {
			// 	comments = comments.filter((comment) => comment._id !== data?.commentId);
			// }
		}
	});
</script>

{#snippet LikeBtn()}
	{#if !post.likedBy.includes(user._id)}
		<CommonForm actionName="likePost" formName="likePost" bind:formResult={likeFormResult}>
			<input type="hidden" name="post-id" value={post._id} />
			<button type="submit" class="container" id="like-btn">
				<Heart size="1.2rem" color="red" />
				<span>{post.likeCnt}</span>
			</button>
		</CommonForm>
	{:else}
		<CommonForm actionName="unlikePost" formName="unlikePost" bind:formResult={likeFormResult}>
			<input type="hidden" name="post-id" value={post._id} />
			<button type="submit" class="container" id="like-btn">
				<Heart size="1.2rem" color="red" fill="red" />
				<span>{post.likeCnt}</span>
			</button>
		</CommonForm>
	{/if}
{/snippet}

{#snippet HeaderModule()}
	<header class="container module">
		<h1>자유게시판</h1>
		<a href="/board">목록</a>
	</header>
{/snippet}

{#snippet ArticleModule()}
	<section class="container-col module">
		<article>
			<header class="container">
				<div class="container-col">
					<h2>{post.title}</h2>
					<p>
						{post.displayName} | {GeneralUtils.parseDate(post.createdAt)} | 조회수: {post.viewCnt}
					</p>
				</div>
				{#if post.userId === user._id}
					<div class="container">
						<a href="{post._id}/edit" class="btn-anchor">수정</a>
						<div class="delete-post-form">
							<CommonForm actionName="deletePost" formName="deletePost">
								<input type="hidden" name="post-id" value={post._id} />
								<button type="submit">삭제</button>
							</CommonForm>
						</div>
					</div>
				{/if}
			</header>
			<hr />
			<pre>{post.content}</pre>
			{@render LikeBtn()}
		</article>
	</section>
{/snippet}

{#snippet CommentForm()}
	<CommonForm
		actionName="createComment"
		formName="createComment"
		bind:formResult={commentFormResult}
	>
		<div id="comment-form-div" class="container-col">
			<div class="container">
				<span><b>[{UserService.fillDisplayName(user, displayType)}]</b></span>&nbsp;
				<div class="container" id="radio-div">
					<label for="anonymous">익명</label>
					<input
						type="radio"
						id="anonymous"
						name="displayType"
						value="anonymous"
						checked
						bind:group={displayType}
					/>
					<label for="nickname">별명</label>
					<input
						type="radio"
						id="nickname"
						name="displayType"
						value="nickname"
						bind:group={displayType}
					/>
					<label for="realName">실명</label>
					<input
						type="radio"
						id="realName"
						name="displayType"
						value="realName"
						bind:group={displayType}
					/>
				</div>
			</div>
			<div class="container">
				<textarea name="content" autocomplete="off" bind:this={commentTextarea}></textarea>
				<button type="submit">작성</button>
			</div>
		</div>
	</CommonForm>
{/snippet}

{#snippet CommentItem(comment: Comment)}
	<div class="container comment-div">
		<p><b>[{comment.displayName}]</b> {comment.content}</p>
		<div class="container">
			<p>{GeneralUtils.parseDate(comment.createdAt)}</p>
			{#if comment.userId === user._id}
				<div class="delete-comment-form">
					<CommonForm
						actionName="deleteComment"
						formName="deleteComment"
						bind:formResult={commentFormResult}
					>
						<input type="hidden" name="comment-id" value={comment._id} />
						<button type="submit">삭제</button>
					</CommonForm>
				</div>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet CommentModule()}
	<section class="container-col module">
		{@render CommentForm()}
		{#if comments.length === 0}
			<p>작성된 댓글이 없습니다.</p>
		{:else}
			{#each comments as comment (comment._id)}
				{@render CommentItem(comment)}
			{/each}
		{/if}
	</section>
{/snippet}

{@render HeaderModule()}
{@render ArticleModule()}
{@render CommentModule()}

<style lang="scss">
	section {
		width: stretch;
		margin: 0.5rem;
	}

	article {
		width: stretch;

		header > div {
			align-items: flex-start;
		}

		pre {
			margin: 0.5rem;
		}

		.delete-post-form {
			width: fit-content;
		}
	}

	.comment-div {
		width: stretch;
		justify-content: space-between;
		padding: 0.25rem;
		border-bottom: solid gray 0.1rem;

		.delete-comment-form {
			width: fit-content;
		}

		button {
			margin-left: 0.5rem;
		}
	}

	#comment-form-div {
		justify-content: space-between;
		width: stretch;
		margin-top: 1rem;
		padding: 0.25rem;

		label {
			word-break: keep-all;
		}

		& > div {
			width: stretch;
			justify-content: flex-start;
			margin-bottom: 0.5rem;
		}

		input:not([type='radio']),
		textarea {
			padding: 0.5rem;
			font-size: 1rem;
			width: stretch;
		}

		textarea {
			resize: vertical;
		}

		button {
			word-break: keep-all;
			margin-left: 0.5rem;
		}

		#radio-div {
			justify-content: flex-start;
			margin-left: 1rem;

			input {
				margin-left: 0.5rem;
				margin-right: 1.5rem;
			}
		}
	}

	header {
		width: stretch;
		margin: 0.5rem;
		justify-content: space-between;
	}

	#like-btn {
		border: solid 0.1rem black;
		border-radius: 0.5rem;
		padding: 0.1rem 0.4rem;
		width: fit-content;

		span {
			margin-left: 0.2rem;
		}
	}
</style>
