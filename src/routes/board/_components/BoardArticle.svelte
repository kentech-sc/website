<script lang="ts">
	import type { ActionResult } from '@sveltejs/kit';
	import type { Post } from '$lib/board/types.js';
	import type { User } from '$lib/user/types';
	import GeneralUtils from '$lib/general/utils.js';
	import { Types } from 'mongoose';

	import Heart from '@lucide/svelte/icons/heart';
	import CommonForm from '$lib/components/CommonForm.svelte';

	let { post = $bindable<Post>(), user }: { post: Post; user: User } = $props();

	let likeFormResult = $state<ActionResult | null>(null);

	let liked = $derived<boolean>(post.likedBy.includes(user._id));

	$effect(() => {
		if (likeFormResult?.type === 'success') {
			const updatedPost = JSON.parse(likeFormResult.data?.post ?? '{}');
			if (updatedPost.likeCnt > post.likeCnt) {
				post.likedBy.push(user._id);
			} else if (updatedPost.likeCnt < post.likeCnt) {
				post.likedBy = post.likedBy.filter((id) => !new Types.ObjectId(id).equals(user._id));
			}
			post.likeCnt = updatedPost.likeCnt;
		}
	});
</script>

{#snippet LikeBtn()}
	<CommonForm
		actionName={liked ? 'unlikePost' : 'likePost'}
		formName={liked ? 'unlikePost' : 'likePost'}
		bind:formResult={likeFormResult}
	>
		<input type="hidden" name="post-id" value={post._id} />
		<button type="submit" class="container" id="like-btn">
			<Heart size="1.2rem" color="red" fill={liked ? 'red' : 'transparent'} />
			<span>{post.likeCnt}</span>
		</button>
	</CommonForm>
{/snippet}

{#snippet BtnGroup()}
	<div class="container">
		<a href="{post._id}/edit" class="btn-anchor">수정</a>
		<div class="delete-post-form">
			<CommonForm actionName="deletePost" formName="deletePost">
				<input type="hidden" name="post-id" value={post._id} />
				<button type="submit">삭제</button>
			</CommonForm>
		</div>
	</div>
{/snippet}

{#snippet ArticleHeader()}
	<header class="container">
		<div class="container-col">
			<h2>{post.title}</h2>
			<p>
				{post.displayName} | {GeneralUtils.parseDate(post.createdAt)} | 조회수: {post.viewCnt}
			</p>
		</div>
		{#if post.userId === user._id}{@render BtnGroup()}{/if}
	</header>
{/snippet}

<section class="container-col module">
	<article>
		{@render ArticleHeader()}
		<hr />
		<pre>{post.content}</pre>
		{@render LikeBtn()}
	</article>
</section>

<style lang="scss">
	article {
		width: stretch;

		header > div {
			align-items: flex-start;
		}

		.delete-post-form {
			width: fit-content;
		}
	}

	header {
		width: stretch;
		justify-content: space-between;
	}

	#like-btn {
		border: solid 0.1rem black;
		border-radius: 0.5rem;
		padding: 0.1rem 0.4rem;
		width: fit-content;
		margin-top: 0.5rem;

		span {
			margin-left: 0.2rem;
		}
	}
</style>
