<script lang="ts">
	import type { Post } from '$lib/types/post.type.js';

	import BoardHeader from './_components/BoardHeader.svelte';
	import BoardList from './_components/BoardList.svelte';

	let { data } = $props();
	const posts = $derived<Post[]>(data.posts);
	const filePresence = $derived(data.filePresence);
	const prevHref = $derived<string | undefined>(data.prevHref);
	const nextHref = $derived<string | undefined>(data.nextHref);
	const canCreatePost = $derived<boolean>(data.canCreatePost);
</script>

<BoardHeader pageType="list" {canCreatePost} />
<BoardList {posts} {filePresence} {prevHref} {nextHref} />
