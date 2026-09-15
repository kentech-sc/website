<script lang="ts">
	import BoardArticle from '../../board/_components/BoardArticle.svelte';
	import BoardHeader from '../../board/_components/BoardHeader.svelte';
	import CommentSection from '../../board/_components/CommentSection.svelte';

	import type { Comment } from '$lib/types/comment.type.js';
	import type { FileMeta } from '$lib/types/file-meta.type.js';
	import type { Post } from '$lib/types/post.type.js';

	import FileList from '$components/FileList.svelte';
	import { BoardId } from '$lib/types/board.type.js';

	let { data } = $props();

	const post = $derived<Post>(data.post);
	const comments = $derived<Comment[]>(data.comments);
	const fileMetas = $derived<FileMeta[]>(data.files);
</script>

<BoardHeader boardId={BoardId.Bylaw} pageType="detail" />

<section class="container-col">
	<BoardArticle {post} user={data.user} permissions={data.postPermissions} />
	<FileList {fileMetas} isEditing={false} />
	<CommentSection
		authorId={post.userId}
		{comments}
		user={data.user}
		commentPermissions={data.commentPermissions}
		canCreateComment={data.canCreateComment}
	/>
</section>

<style lang="scss">
	section {
		gap: 1rem;
		width: 100%;
	}
</style>
