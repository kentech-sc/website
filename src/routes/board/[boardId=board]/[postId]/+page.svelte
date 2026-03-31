<script lang="ts">
	import { page } from '$app/state';

	import type { Post } from '$lib/types/post.type.js';
	import type { Comment } from '$lib/types/comment.type.js';
	import type { FileMeta } from '$lib/types/file-meta.type.js';

	import BoardHeader from '../_components/BoardHeader.svelte';
	import BoardArticle from '../_components/BoardArticle.svelte';
	import CommentSection from '../_components/CommentSection.svelte';
	import FileList from '$components/FileList.svelte';

	const user = JSON.parse(page.data.user);

	let { data } = $props();

	let post = $state<Post>(JSON.parse(data?.post || '{}'));
	let comments = $derived<Comment[]>(JSON.parse(data?.comments || '[]'));
	let fileMetas = $derived<Array<FileMeta>>(JSON.parse(data?.files || '[]'));
</script>

<BoardHeader pageType="detail" />
<BoardArticle bind:post {user} />
<FileList {fileMetas} isEditing={false} />
<CommentSection authorId={post.userId} {comments} {user} />
