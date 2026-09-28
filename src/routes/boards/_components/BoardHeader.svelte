<script lang="ts">
	import Pen from '@lucide/svelte/icons/pencil';
	import List from '@lucide/svelte/icons/text';

	import type { BoardId as BoardIdType } from '$lib/types/board.type.js';

	import PageHeader from '$components/PageHeader.svelte';
	import { BOARD_DEFINITIONS } from '$lib/shared/board.js';
	import { boardListPath, boardNewPath } from '$lib/shared/paths.js';

	let {
		boardId,
		pageType,
		canCreatePost = false
	}: { boardId: BoardIdType; pageType: string; canCreatePost?: boolean } = $props();

	const board = $derived(BOARD_DEFINITIONS[boardId]);
	const title = $derived(board.title);
	const description = $derived(board.description);
	const listHref = $derived(boardListPath(boardId));
	const newHref = $derived(boardNewPath(boardId));
</script>

<PageHeader {title} {description}>
	{#if pageType === 'list' && canCreatePost}
		<a href={newHref} class="ui-button is-primary">
			<Pen size="0.8rem" />
			<span>글쓰기</span>
		</a>
	{:else if pageType === 'new' || pageType === 'edit' || pageType === 'detail'}
		<a href={listHref} class="ui-button is-primary">
			<List size="0.8rem" />
			<span>목록</span>
		</a>
	{/if}
</PageHeader>
