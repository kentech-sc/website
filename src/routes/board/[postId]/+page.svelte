<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { Comment, Post } from '$lib/board/types.js';
	import GeneralUtils from '$lib/general/utils.js';

	import Heart from '@lucide/svelte/icons/heart';

	let { data } = $props();

	let post = $derived<Post>(JSON.parse(data?.post || '{}'));
	let commentArr = $derived<Comment[]>(JSON.parse(data?.commentArr || '[]'));
	let errorMsg = $state<string>('');

	const user = JSON.parse(page.data.user);

	function handleEnhance() {
		return async ({
			result,
			update,
			// action
		}: {
			result: ActionResult;
			update: () => Promise<void>;
			// action: URL;
		}) => {
			// if (result.type === 'success' && action.search === '?/createComment') {
			// 	commentArr.push(JSON.parse(result.data?.comment ?? '{}'));
			// 	await applyAction(result);
			// } else if (result.type === 'success' && action.search === '?/deleteComment') {
			// 	commentArr = commentArr.filter(
			// 		(comment: Comment) => comment._id.toString() !== result.data?.commentIdRaw
			// 	);
			// 	await applyAction(result);
			// } else if (result.type === 'success' && action.search === '?/likePost') {
			// 	const updated_post = JSON.parse(result.data?.post ?? '{}');
			// 	post.likeCnt = updated_post.likeCnt;
			// 	post.likedBy = updated_post.likedBy;
			// 	await applyAction(result);
			// } else if (result.type === 'success' && action.search === '?/unlikePost') {
			// 	const updated_post = JSON.parse(result.data?.post ?? '{}');
			// 	post.likeCnt = updated_post.likeCnt;
			// 	post.likedBy = updated_post.likedBy;
			// 	await applyAction(result);
			if (result.type === 'failure') {
				errorMsg = result.data?.message || '알 수 없는 오류가 발생했습니다.';
			} else if (result.type === 'error') {
				errorMsg = result.error?.message || '알 수 없는 오류가 발생했습니다.';
			} else {
				await update();
			}
		};
	}
</script>

{#snippet LikeBtn()}
	{#if !post.likedBy.includes(user._id)}
		<form method="post" action="?/likePost" use:enhance={handleEnhance}>
			<input type="hidden" name="post-id" value={post._id} />
			<button type="submit" class="container" id="like-btn">
				<Heart size="1.2rem" color="red" />
				<span>{post.likeCnt}</span>
			</button>
		</form>
	{:else}
		<form method="post" action="?/unlikePost" use:enhance={handleEnhance}>
			<input type="hidden" name="post-id" value={post._id} />
			<button type="submit" class="container" id="like-btn">
				<Heart size="1.2rem" color="red" fill="red" />
				<span>{post.likeCnt}</span>
			</button>
		</form>
	{/if}
{/snippet}

<div id="layout" class="container-col">
	<header class="container module">
		<h1>자유게시판</h1>
		<a href="/board">목록</a>
	</header>

	<section class="container-col module">
		<article>
			<header class="container">
				<div class="container-col">
					<h2>{post.title}</h2>
					<p>{post.userName} | {GeneralUtils.parseDate(post.createdAt)} | 조회수: {post.viewCnt}</p>
				</div>
				{#if post.userId === user._id}
					<form method="post" action="?/deletePost">
						<input type="hidden" name="post-id" value={post._id} />
						<button type="submit">삭제</button>
					</form>
				{/if}
			</header>
			<hr />
			<pre>{post.content}</pre>
			{@render LikeBtn()}
		</article>
	</section>

	<section class="container-col module">
		{#if commentArr.length === 0}
			<p>작성된 댓글이 없습니다.</p>
		{:else}
			{#each commentArr as comment (comment._id)}
				<div class="container comment-div">
					<p><b>[{comment.userName}]</b> {comment.content}</p>
					<div class="container">
						<p>{GeneralUtils.parseDate(comment.createdAt)}</p>
						{#if comment.userId === user._id}
							<form
								method="post"
								action="?/deleteComment"
								data-sveltekit-replacestate
								use:enhance={handleEnhance}
							>
								<input type="hidden" name="comment-id" value={comment._id} />
								<button type="submit">삭제</button>
							</form>
						{/if}
					</div>
				</div>
			{/each}
		{/if}

		<form
			id="comment-form"
			method="post"
			action="?/createComment"
			class="container"
			data-sveltekit-replacestate
			use:enhance={handleEnhance}
		>
			<span><b>[{user.name}]</b></span>&nbsp;
			<input type="text" name="content" autocomplete="off" />
			<button type="submit">작성</button>
		</form>

		{#if errorMsg}
			<p>{errorMsg}</p>
		{/if}
	</section>
</div>

<style>
	#layout {
		width: 100%;
	}

	section {
		width: 100%;
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
	}

	.comment-div {
		width: 100%;
		justify-content: space-between;
		padding: 0.25rem;
		border-bottom: solid gray 0.1rem;

		button {
			margin-left: 0.5rem;
		}
	}

	#comment-form {
		justify-content: space-between;
		width: 100%;
		margin-top: 1rem;
		padding: 0.25rem;
		input {
			padding: 0.5rem;
			font-size: 1rem;
			width: stretch;
		}

		button {
			word-break: keep-all;
			margin-left: 0.5rem;
		}
	}

	header {
		width: 100%;
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
