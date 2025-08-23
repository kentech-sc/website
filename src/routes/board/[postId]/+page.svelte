<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { Comment } from '$lib/board/type';
	import GeneralUtils from '$lib/utils/general';

	let { data } = $props();

	const post = JSON.parse(data?.post || '{}');
	let commentArr = $state(JSON.parse(data?.commentArr || '[]'));
	let errorMsg = $state<string>('');

	const user = JSON.parse(page.data.user);

	function handleEnhance() {
		return async ({
			result,
			update,
			action
		}: {
			result: ActionResult;
			update: () => Promise<void>;
			action: URL;
		}) => {
			if (result.type === 'success' && action.search === '?/createComment') {
				commentArr.push(JSON.parse(result.data?.comment ?? '{}'));
				await update();
			} else if (result.type === 'success' && action.search === '?/deleteComment') {
				commentArr = commentArr.filter(
					(comment: Comment) => comment._id.toString() !== result.data?.commentIdRaw
				);
				await update();
			} else if (result.type === 'failure') {
				errorMsg = result.data?.message || '알 수 없는 오류가 발생했습니다.';
			} else if (result.type === 'error') {
				errorMsg = result.error?.message || '알 수 없는 오류가 발생했습니다.';
			}
		};
	}
</script>

<h1>Board</h1>

<div class="container-col">
	<h2>{post.title}</h2>
	<p>{post.content}</p>
	<p>{post.userName}</p>
	<p>{GeneralUtils.parseDate(post.createdAt)}</p>
	{#if post.userId === user._id}
		<form method="post" action="?/deletePost">
			<input type="hidden" name="post-id" value={post._id} />
			<button type="submit">Delete</button>
		</form>
	{/if}
</div>

<hr />

{#each commentArr as comment (comment._id)}
	<div class="container">
		<p>{comment.content}</p>
		<p>{comment.userName}</p>
		<p>{GeneralUtils.parseDate(comment.createdAt)}</p>
		{#if comment.userId === user._id}
			<form
				method="post"
				action="?/deleteComment"
				data-sveltekit-replacestate
				use:enhance={handleEnhance}
			>
				<input type="hidden" name="comment-id" value={comment._id} />
				<button type="submit">Delete</button>
			</form>
		{/if}
	</div>
{/each}

<hr />

<form
	method="post"
	action="?/createComment"
	class="container"
	data-sveltekit-replacestate
	use:enhance={handleEnhance}
>
	<label for="content">Comment</label>
	<input type="text" name="content" />
	<button type="submit">Submit</button>
</form>

{#if errorMsg}
	<p>{errorMsg}</p>
{/if}

<style>
	div {
		display: flex;
	}
</style>
