<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';

	import type { Comment, CommentPermissionMap } from '$lib/types/comment.type.js';
	import type { UserId } from '$lib/types/user.type.js';

	import { parseDate } from '$lib/shared/utils.js';

	let {
		authorId,
		comments,
		commentPermissions
	}: { authorId: UserId; comments: Comment[]; commentPermissions: CommentPermissionMap } = $props();
</script>

{#if comments.length === 0}
	<p>작성된 댓글이 없습니다.</p>
{:else}
	{#each comments as comment (comment._id)}
		<div class="container comment-div">
			{#if authorId === comment.userId}
				<p><b style="color: var(--secondary)">[{comment.displayName}]</b> {comment.content}</p>
			{:else}
				<p><b>[{comment.displayName}]</b> {comment.content}</p>
			{/if}
			<div class="container">
				<p>{parseDate(comment.createdAt)}</p>
				{#if commentPermissions[comment._id]?.canDelete}
					<div class="delete-comment-form">
						<CommonForm
							actionName="deleteComment"
							formName="deleteComment"
							policy="reload"
						>
							<input type="hidden" name="comment-id" value={comment._id} />
							<button type="submit">삭제</button>
						</CommonForm>
					</div>
				{/if}
			</div>
		</div>
		<hr />
	{/each}
{/if}

<style lang="scss">
	.comment-div {
		width: 100%;
		justify-content: space-between;
		padding: 0.25rem;

		.delete-comment-form {
			width: fit-content;
		}

		button {
			margin-left: 0.5rem;
			font-weight: bold;
		}
	}
</style>
