<script lang="ts">
	import BoardHeader from '../_components/BoardHeader.svelte';
	import BoardList from '../_components/BoardList.svelte';

	import type { BoardId } from '$lib/types/board.type.js';

	import { page } from '$app/state';

	let { data } = $props();
	const postPage = $derived(data.postPage);
	const filePresence = $derived(data.filePresence);
	const canCreatePost = $derived<boolean>(data.canCreatePost);
	const boardId = $derived(page.params.boardId as BoardId);
</script>

<BoardHeader {boardId} pageType="list" {canCreatePost} />
<BoardList {postPage} {filePresence} />
