<script lang="ts">
	import { page } from '$app/state';

	import type { Comment } from '$lib/types/comment.type.js';
	import type { FileMeta } from '$lib/types/file-meta.type.js';
	import type { Post } from '$lib/types/post.type.js';

	import BoardArticle from '../_components/BoardArticle.svelte';
	import BoardHeader from '../_components/BoardHeader.svelte';
	import CommentSection from '../_components/CommentSection.svelte';
	import FileList from '$components/FileList.svelte';

	const user = $derived(page.data.user);

	let { data } = $props();
	const post = $derived<Post>(data.post);
	const comments = $derived<Comment[]>(data.comments);
	const fileMetas = $derived<FileMeta[]>(data.files);
	const postPermissions = $derived(data.postPermissions);
	const commentPermissions = $derived(data.commentPermissions);
	const canCreateComment = $derived<boolean>(data.canCreateComment);
</script>

<BoardHeader pageType="detail" />
<BoardArticle {post} {user} permissions={postPermissions} />
<FileList {fileMetas} isEditing={false} />
<CommentSection authorId={post.userId} {comments} {user} {commentPermissions} {canCreateComment} />
