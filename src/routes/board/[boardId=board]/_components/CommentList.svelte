<script lang="ts">
	import { DisplayType, type User, type UserId } from '$lib/types/user.type.js';
	import type { Comment } from '$lib/types/comment.type.js';

	import type { ActionResult } from '@sveltejs/kit';

	import * as CommonUtils from '$lib/common/utils.js';
	import CommonForm from '$components/CommonForm.svelte';
	import Permission from '../../../_components/Permission.svelte';

	import { invalidateAll } from '$app/navigation';

	let { authorId, comments, user }: { authorId: UserId, comments: Comment[]; user: User } = $props();

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			invalidateAll();
		}
	});
</script>

{#snippet DeleteBtn(comment: Comment)}
	<div class="delete-comment-form">
		<CommonForm actionName="deleteComment" formName="deleteComment" bind:formResult>
			<input type="hidden" name="comment-id" value={comment._id} />
			<button type="submit">삭제</button>
		</CommonForm>
	</div>
{/snippet}

{#snippet CommentItem(comment: Comment)}
	<div class="container comment-div">
		{#if authorId === user._id && comment.displayType === DisplayType.Anonymous}
			<p><b style="color: var(--secondary)">[익명의 글쓴이]</b> {comment.content}</p>
		{:else if authorId === user._id}
			<p><b style="color: var(--secondary)">[{comment.displayName}]</b> {comment.content}</p>
		{:else}
			<p><b>[{comment.displayName}]</b> {comment.content}</p>
		{/if}
		<div class="container">
			<p>{CommonUtils.parseDate(comment.createdAt)}</p>
			<Permission {user} ownerId={comment.userId} minRole="moderator"
				>{@render DeleteBtn(comment)}</Permission
			>
		</div>
	</div>
{/snippet}

{#if comments.length === 0}
	<p>작성된 댓글이 없습니다.</p>
{:else}
	{#each comments as comment (comment._id)}
		{@render CommentItem(comment)}
		<hr />
	{/each}
{/if}

<style lang="scss">
	.comment-div {
		width: stretch;
		justify-content: space-between;
		padding: 0.25rem;

		.delete-comment-form {
			width: fit-content;
		}

		button {
			margin-left: 0.5rem;
		}
	}
</style>
