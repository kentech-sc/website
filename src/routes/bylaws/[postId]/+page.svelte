<script lang="ts">
	import BoardArticle from '../../boards/_components/BoardArticle.svelte';
	import BoardHeader from '../../boards/_components/BoardHeader.svelte';
	import CommentSection from '../../boards/_components/CommentSection.svelte';

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

<section class="page">
	<BoardHeader boardId={BoardId.Bylaw} pageType="detail" />

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
