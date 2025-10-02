<script lang="ts">
	import { page } from '$app/state';
	import type { Comment, Post } from '$lib/board/types.js';

	import BoardHeader from '../_components/BoardHeader.svelte';
	import BoardArticle from '../_components/BoardArticle.svelte';
	import CommentSection from '../_components/CommentSection.svelte';

	const user = JSON.parse(page.data.user);

	let { data } = $props();

	let post = $state<Post>(JSON.parse(data?.post || '{}'));
	let comments = $derived<Comment[]>(JSON.parse(data?.comments || '[]'));
</script>

<BoardHeader pageType="detail" />
<BoardArticle bind:post {user} />
<CommentSection {comments} {user} />
