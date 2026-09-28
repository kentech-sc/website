<script lang="ts">
	import '$style/nmu.scss';

	import Clock from '@lucide/svelte/icons/clock';
	import Eye from '@lucide/svelte/icons/eye';
	import Heart from '@lucide/svelte/icons/heart';
	import Message from '@lucide/svelte/icons/message-circle';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash from '@lucide/svelte/icons/trash-2';
	import DOMPurify from 'isomorphic-dompurify';

	import type { Post, PostPermissions } from '$lib/types/post.type.js';
	import type { User } from '$lib/types/user.type.js';

	import ArticleHeader from '$components/ArticleHeader.svelte';
	import InlineActionForm from '$components/InlineActionForm.svelte';
	import { boardEditPath, boardListPath } from '$lib/shared/paths.js';
	import { formatDate } from '$lib/shared/utils.js';

	let { post, user, permissions }: { post: Post; user: User; permissions: PostPermissions } =
		$props();

	let liked = $derived<boolean>(post.likedBy.includes(user.id));
	const listHref = $derived(boardListPath(post.boardId));
	const editHref = $derived(boardEditPath(post.boardId, post.id.toString()));
</script>

{#snippet LikeButton()}
	{#if permissions.canLike || permissions.canUnlike}
		<InlineActionForm
			actionName={liked ? 'unlikePost' : 'likePost'}
			buttonClass="ui-button"
			hiddenFields={[{ name: 'post-id', value: post.id }]}
			policy={{ kind: 'detail', notFoundRedirectTo: listHref }}
		>
			<Heart size="1rem" color="red" fill={liked ? 'red' : 'transparent'} />
			<span>{post.likedBy.length}</span>
		</InlineActionForm>
	{:else}
		<div class="ui-button">
			<Heart size="1rem" color="red" fill="transparent" />
			<span>{post.likedBy.length}</span>
		</div>
	{/if}
{/snippet}

{#snippet actions()}
	{#if permissions.canEdit}
		<a class="ui-button is-icon is-primary" aria-label="수정" href={editHref}
			><Pencil size="1rem" /></a
		>
	{/if}
	{#if permissions.canDelete}
		<InlineActionForm
			actionName="deletePost"
			buttonLabel="삭제"
			buttonClass="ui-button is-icon is-danger"
			hiddenFields={[{ name: 'post-id', value: post.id }]}
			policy={{ kind: 'detail', notFoundRedirectTo: listHref }}
		>
			<Trash size="1rem" />
		</InlineActionForm>
	{/if}
{/snippet}

<article class="module">
	<ArticleHeader {actions}>
		{#snippet title()}{post.title}{/snippet}
		{#snippet metadata()}
			<span>{post.displayName}</span>
			<span><Clock size="0.8rem" />{formatDate(post.createdAt)}</span>
			<span><Eye size="0.8rem" />{post.viewCount}</span>
			<span><Message size="0.8rem" />{post.commentCount}</span>
			<span><Heart size="0.8rem" />{post.likedBy.length}</span>
		{/snippet}
	</ArticleHeader>
	<!-- eslint-disable svelte/no-at-html-tags -->
	<pre class="nmu">{@html DOMPurify.sanitize(post.content)}</pre>
	<footer>{@render LikeButton()}</footer>
</article>

<style lang="scss">
	article {
		pre {
			line-height: 1.5;
		}
	}

	footer {
		margin: 0.6rem 0 0.2rem;
	}
</style>
