<script lang="ts">
	import type { User } from '$lib/user/types.js';
	import type { Comment } from '$lib/board/types.js';
	import type { ActionResult } from '@sveltejs/kit';

	import GeneralUtils from '$lib/general/utils.js';
	import CommonForm from '$lib/components/CommonForm.svelte';
	import { invalidateAll } from '$app/navigation';

	let { comments, user }: { comments: Comment[]; user: User } = $props();

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
		<p><b>[{comment.displayName}]</b> {comment.content}</p>
		<div class="container">
			<p>{GeneralUtils.parseDate(comment.createdAt)}</p>
			{#if comment.userId === user._id}{@render DeleteBtn(comment)}{/if}
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
