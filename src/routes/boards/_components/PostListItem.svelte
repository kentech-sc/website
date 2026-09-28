<script lang="ts">
	import type { FilePresence } from '$lib/types/general.type.js';
	import type { Post } from '$lib/types/post.type.js';

	import FileAttachmentIcons from '$components/FileAttachmentIcons.svelte';
	import { boardPostPath } from '$lib/shared/paths.js';
	import { formatRelativeDate } from '$lib/shared/utils.js';

	let { post, attachment }: { post: Post; attachment?: FilePresence[string] } = $props();
</script>

<a href={boardPostPath(post.boardId, post.id)} class="content-list-item">
	<header>
		<strong>{post.title}</strong>
		<FileAttachmentIcons hasImage={attachment?.hasImage} hasFile={attachment?.hasFile} />
		<span class="comment-count">[{post.commentCount}]</span>
	</header>
	<footer>
		<span>{post.displayName} · 조회 {post.viewCount} · 좋아요 {post.likedBy.length}</span>
		<time datetime={post.createdAt}>{formatRelativeDate(post.createdAt)}</time>
	</footer>
</a>

<style lang="scss">
	.comment-count {
		flex-shrink: 0;
		margin-left: 0.2rem;
		color: var(--secondary);
		font-weight: 600;
		font-size: 0.7rem;
	}
</style>
