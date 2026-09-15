<script lang="ts">
	import BoardForm from '../../_components/BoardForm.svelte';
	import BoardHeader from '../../_components/BoardHeader.svelte';

	import type { BoardId } from '$lib/types/board.type.js';

	import { page } from '$app/state';

	const { data } = $props();

	const user = $derived(data.user);
	const boardId = $derived(page.params.boardId as BoardId);
</script>

<BoardHeader {boardId} pageType="new" />
<BoardForm {user} />
