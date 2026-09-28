<script lang="ts">
	import Trash2 from '@lucide/svelte/icons/trash-2';

	import type { Comment, CommentPermissionMap } from '$lib/types/comment.type.js';
	import type { UserId } from '$lib/types/user.type.js';

	import InlineActionForm from '$components/InlineActionForm.svelte';
	import { formatDate } from '$lib/shared/utils.js';

	let {
		authorId,
		comments,
		commentPermissions
	}: { authorId: UserId; comments: Comment[]; commentPermissions: CommentPermissionMap } = $props();
</script>

{#each comments as comment (comment.id)}
	<article class="module">
		<header>
			<strong class:is-author={authorId === comment.userId}>{comment.displayName}</strong>
			<div>
				<time datetime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
				{#if commentPermissions[comment.id]?.canDelete}
					<InlineActionForm
						actionName="deleteComment"
						buttonLabel="삭제"
						buttonClass="ui-button is-icon is-danger is-compact"
						hiddenFields={[{ name: 'comment-id', value: comment.id }]}
						policy="reload"
					>
						<Trash2 size="0.8rem" />
					</InlineActionForm>
				{/if}
			</div>
		</header>
		<p>{comment.content}</p>
	</article>
{/each}

<style lang="scss">
	article {
		padding: 0.8rem 1rem;
	}
	header,
	header > div {
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}
	header {
		justify-content: space-between;
		margin-bottom: 0.4rem;
		border-bottom: 0.1rem solid var(--gray-border);
	}
	strong {
		font-weight: 600;
	}
	strong.is-author {
		color: var(--secondary);
		font-size: 0.9rem;
	}
	p {
		font-size: 0.9rem;
	}
	time {
		color: var(--gray);
		font-size: 0.7rem;
	}
</style>
