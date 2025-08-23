<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { Post } from '$lib/board/type';
	import GeneralUtils from '$lib/utils/general';

	let { data } = $props();
	const postArr = $state<Post[]>(JSON.parse(data?.postArr || '[]'));
	let errorMsg = $state<string>('');

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
			if (result.type === 'success' && action.search === '?/createPost') {
				postArr.unshift(JSON.parse(result.data?.post ?? '{}'));
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
	{#each postArr as post (post._id)}
		<div class="container">
			<a href={`/board/${post._id}`}>
				<h2>[{post.title}]</h2>
				<p>Content: {post.content}</p>
				<p>UserName: {post.userName}</p>
				<p>Date: {GeneralUtils.parseDate(post.createdAt)}</p>
			</a>
		</div>
		<hr />
	{/each}
</div>

<hr />

<form
	method="post"
	action="?/createPost"
	class="container-col"
	data-sveltekit-replacestate
	use:enhance={handleEnhance}
>
	<label for="title">Title</label>
	<input type="text" name="title" />
	<label for="content">Content</label>
	<textarea name="content"></textarea>
	<button type="submit">Submit</button>
</form>

{#if errorMsg}
	<p>{errorMsg}</p>
{/if}

<style>
</style>
