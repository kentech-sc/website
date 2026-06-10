<script lang="ts">
	import CommentForm from './CommentForm.svelte';
	import CommentList from './CommentList.svelte';

	import type { Comment, CommentPermissionMap } from '$lib/types/comment.type.js';
	import type { User, UserId } from '$lib/types/user.type.js';

	let {
		authorId,
		comments,
		user,
		commentPermissions,
		canCreateComment
	}: {
		authorId: UserId;
		comments: Comment[];
		user: User;
		commentPermissions: CommentPermissionMap;
		canCreateComment: boolean;
	} = $props();
</script>

<section class="container-col module">
	{#if canCreateComment}
		<CommentForm {user} />
	{/if}
	<CommentList {authorId} {comments} {commentPermissions} />
</section>
