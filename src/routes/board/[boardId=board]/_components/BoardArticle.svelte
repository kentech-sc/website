<script lang="ts">
	import '$style/nmu.scss';

	import Clock from '@lucide/svelte/icons/clock';
	import Eye from '@lucide/svelte/icons/eye';
	import Heart from '@lucide/svelte/icons/heart';
	import Message from '@lucide/svelte/icons/message-circle';
	import DOMPurify from 'isomorphic-dompurify';

	import type { Post, PostPermissions } from '$lib/types/post.type.js';
	import type { User } from '$lib/types/user.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import { parseDate } from '$lib/shared/utils.js';

	let { post, user, permissions }: { post: Post; user: User; permissions: PostPermissions } =
		$props();

	let liked = $derived<boolean>(post.likedBy.includes(user._id));
</script>

{#snippet LikeButton()}
	{#if permissions.canLike || permissions.canUnlike}
		<CommonForm
			actionName={liked ? 'unlikePost' : 'likePost'}
			formName={liked ? 'unlikePost' : 'likePost'}
			policy={{ kind: 'detail', notFoundRedirectTo: `/board/${post.boardId}` }}
		>
			<input type="hidden" name="post-id" value={post._id} />
			<button type="submit" class="container like-button">
				<Heart size="1.2rem" color="red" fill={liked ? 'red' : 'transparent'} />
				<span>{post.likedBy.length}</span>
			</button>
		</CommonForm>
	{:else}
		<div class="container like-button">
			<Heart size="1.2rem" color="red" fill="transparent" />
			<span>{post.likedBy.length}</span>
		</div>
	{/if}
{/snippet}

{#snippet ActionGroup()}
	<div class="container">
		{#if permissions.canEdit}
			<a href="{post._id}/edit" class="btn-anchor">수정</a>
		{/if}
		{#if permissions.canDelete}
			<div class="delete-post-form">
				<CommonForm
					actionName="deletePost"
					formName="deletePost"
					policy={{ kind: 'detail', notFoundRedirectTo: `/board/${post.boardId}` }}
				>
					<input type="hidden" name="post-id" value={post._id} />
					<button type="submit" class="delete-btn">삭제</button>
				</CommonForm>
			</div>
		{/if}
	</div>
{/snippet}

<section class="container-col module">
	<article>
		<header class="container">
			<div class="container-col">
				<h2>{post.title}</h2>
				<p>{post.displayName}</p>
				<p>
					<span><Clock size="1rem" color="var(--gray-text)" />{parseDate(post.createdAt)}</span>
					<span><Eye size="1rem" color="var(--gray-text)" />{post.viewCnt}</span>
					<span><Message size="1rem" color="var(--gray-text)" />{post.commentCnt}</span>
					<span><Heart size="1rem" color="var(--gray-text)" />{post.likedBy.length}</span>
				</p>
			</div>
			{#if permissions.canEdit || permissions.canDelete}
				{@render ActionGroup()}
			{/if}
		</header>
		<hr />
		<!-- eslint-disable svelte/no-at-html-tags -->
		<pre class="nmu">{@html DOMPurify.sanitize(post.content)}</pre>
		{@render LikeButton()}
	</article>
</section>

<style lang="scss">
	article {
		width: 100%;

		header > div {
			align-items: flex-start;
			padding-bottom: 0.6rem;

			p:last-child {
				display: flex;
				align-items: center;
				gap: 1rem;
				color: var(--gray-text);
				font-size: 0.8rem;

				span {
					display: flex;
					align-items: center;
					gap: 0.2rem;
				}
			}

			h2 + p {
				line-height: 2.5;
			}
		}

		pre {
			line-height: 1.5;
		}

		.delete-post-form {
			width: fit-content;
		}

		pre :global(img) {
			max-width: 100%;
		}
	}

	header {
		width: 100%;
		justify-content: space-between;
	}

	.like-button {
		border: solid 0.05rem var(--gray-border);
		border-radius: 0.6rem;
		padding: 0.2rem 0.6rem;
		width: fit-content;
		margin-top: 0.6rem;

		span {
			margin-left: 0.2rem;
		}
	}

	.delete-btn {
		font-weight: bold;
	}
</style>
