<script lang="ts">
	import type { Post } from '$lib/types/post.type.js';

	import BoardHeader from './_components/BoardHeader.svelte';
	import BoardList from './_components/BoardList.svelte';

	let { data } = $props();
	const posts = $derived<Post[]>(JSON.parse(data?.posts ?? '[]'));
	const filePresence = $derived(JSON.parse(data?.filePresence ?? '{}'));
	const fromId = $derived<string | undefined>(data.fromId ?? undefined);
	const toId = $derived<string | undefined>(data.toId ?? undefined);
</script>

<BoardHeader pageType="list" />
<BoardList {posts} {filePresence} {toId} {fromId} />
