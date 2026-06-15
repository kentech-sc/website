<script lang="ts">
	import '$style/nmu.scss';

	import Heart from '@lucide/svelte/icons/heart';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash from '@lucide/svelte/icons/trash-2';
	import DOMPurify from 'isomorphic-dompurify';

	import type { Post, PostPermissions } from '$lib/types/post.type.js';
	import type { User } from '$lib/types/user.type.js';

	import CommonArticleHeader from '$components/CommonArticleHeader.svelte';
	import InlineActionForm from '$components/InlineActionForm.svelte';

	let { post, user, permissions }: { post: Post; user: User; permissions: PostPermissions } =
		$props();

	let liked = $derived<boolean>(post.likedBy.includes(user._id));
</script>

{#snippet LikeButton()}
	{#if permissions.canLike || permissions.canUnlike}
		<InlineActionForm
			actionName={liked ? 'unlikePost' : 'likePost'}
			buttonClass="container like-btn"
			hiddenFields={[{ name: 'post-id', value: post._id }]}
			policy={{ kind: 'detail', notFoundRedirectTo: `/board/${post.boardId}` }}
		>
			<Heart size="1rem" color="red" fill={liked ? 'red' : 'transparent'} />
			<span>{post.likedBy.length}</span>
		</InlineActionForm>
	{:else}
		<div class="container like-btn">
			<Heart size="1rem" color="red" fill="transparent" />
			<span>{post.likedBy.length}</span>
		</div>
	{/if}
{/snippet}

{#snippet ActionGroup()}
	<div class="container">
		{#if permissions.canEdit}
			<a class="edit-btn inline-container" href="{post._id}/edit"><Pencil size="1.2rem" /></a>
		{/if}
		{#if permissions.canDelete}
			<div class="delete-form">
				<InlineActionForm
					actionName="deletePost"
					buttonClass="inline-container delete-btn"
					hiddenFields={[{ name: 'post-id', value: post._id }]}
					policy={{ kind: 'detail', notFoundRedirectTo: `/board/${post.boardId}` }}
				>
					<Trash size="1.2rem" />
				</InlineActionForm>
			</div>
		{/if}
	</div>
{/snippet}

<section class="module">
	<article>
		<CommonArticleHeader type="post" item={post}>
			{@render ActionGroup()}
		</CommonArticleHeader>
		<hr />
		<!-- eslint-disable svelte/no-at-html-tags -->
		<pre class="nmu">{@html DOMPurify.sanitize(post.content)}</pre>
		{@render LikeButton()}
	</article>
</section>

<style lang="scss">
	article {
		width: 100%;

		pre {
			line-height: 1.5;
		}
	}

	:global(.like-btn) {
		gap: 0.2rem;
		margin-top: 0.6rem;
		margin-bottom: 0.2rem;
		border: solid 0.05rem var(--gray-border);
		border-radius: 0.4rem;
		padding: 0.2rem 0.6rem;
		width: fit-content;
		font-size: 0.9rem;
	}

	.edit-btn {
		border-radius: 0.4rem;
		padding: 0.2rem 0.4rem;
		color: var(--secondary);

		&:hover {
			background-color: var(--gray-hover);
		}
	}

	.delete-form :global(button) {
		border: none;
		padding: 0.2rem 0.4rem;
		color: var(--error);
	}
</style>
