<script lang="ts">
	import type { Post } from '$lib/board/types.js';
	import BoardHeader from './_components/BoardHeader.svelte';
	import BoardList from './_components/BoardList.svelte';

	let { data } = $props();
	const posts = $derived<Post[]>(JSON.parse(data?.posts ?? '[]'));
	const fromId = $derived<string | null>(data.fromId ?? null);
	const toId = $derived<string | null>(data.toId ?? null);
</script>

<BoardHeader pageType="list" />
<BoardList {posts} {toId} {fromId} />
