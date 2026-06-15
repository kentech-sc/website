<script lang="ts">
	import Trash2 from '@lucide/svelte/icons/trash-2';

	import type { Comment, CommentPermissionMap } from '$lib/types/comment.type.js';
	import type { UserId } from '$lib/types/user.type.js';

	import InlineActionForm from '$components/InlineActionForm.svelte';
	import { parseDate } from '$lib/shared/utils.js';

	let {
		authorId,
		comments,
		commentPermissions
	}: { authorId: UserId; comments: Comment[]; commentPermissions: CommentPermissionMap } = $props();
</script>

{#snippet DisplayName(comment: Comment)}
	<p>
		{#if authorId === comment.userId}
			<span class="author display-name">{comment.displayName}</span>
		{:else}
			<span class="display-name">{comment.displayName}</span>
		{/if}
	</p>
{/snippet}

{#snippet Meta(comment: Comment)}
	<div class="container">
		<p class="date">{parseDate(comment.createdAt)}</p>
		{#if commentPermissions[comment._id]?.canDelete}
			<div class="delete-form">
				<InlineActionForm
					actionName="deleteComment"
					buttonClass="inline-container"
					hiddenFields={[{ name: 'comment-id', value: comment._id }]}
					policy="reload"
				>
					<Trash2 size="0.8rem" />
				</InlineActionForm>
			</div>
		{/if}
	</div>
{/snippet}

{#if comments.length !== 0}
	{#each comments as comment (comment._id)}
		<div class="container-col comment-div module">
			<div class="container">
				{@render DisplayName(comment)}
				{@render Meta(comment)}
			</div>
			<p class="content">{comment.content}</p>
		</div>
	{/each}
{/if}

<style lang="scss">
	.comment-div {
		padding: 0.8rem 1rem;

		& > div {
			justify-content: space-between;
			margin-bottom: 0.4rem;
			border-bottom: 0.1rem solid var(--gray-border);
			width: 100%;
		}
	}

	.content {
		width: 100%;
		font-size: 0.9rem;
	}

	.author {
		color: var(--secondary);
		font-size: 0.9rem;
	}

	.display-name {
		margin-right: 0.2rem;
		font-weight: 600;
	}

	.delete-form :global(button) {
		margin-left: 0.2rem;
		border: none;
		padding: 0.2rem 0.4rem;
		color: var(--error);
	}

	.date {
		color: var(--gray);
		font-size: 0.8rem;
	}
</style>
