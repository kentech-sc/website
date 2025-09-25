<script lang="ts">
	import { page } from '$app/state';
	import type { Comment, Post } from '$lib/board/types.js';

	import BoardHeader from '../_components/BoardHeader.svelte';
	import BoardArticle from '../_components/BoardArticle.svelte';
	import CommentList from '../_components/CommentList.svelte';
	import CommentForm from '../_components/CommentForm.svelte';

	const user = JSON.parse(page.data.user);

	let { data } = $props();

	let post = $state<Post>(JSON.parse(data?.post || '{}'));
	let comments = $derived<Comment[]>(JSON.parse(data?.comments || '[]'));
</script>

<BoardHeader pageType="detail" />
<BoardArticle bind:post {user} />
<section class="container-col module">
	{#if user.group !== 'guest'}
		<CommentForm {user} />
	{/if}
	<CommentList {comments} {user} />
</section>
