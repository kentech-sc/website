<script lang="ts">
	import BoardHeader from '../board/_components/BoardHeader.svelte';
	import BoardList from '../board/_components/BoardList.svelte';

	import { BoardId } from '$lib/types/board.type.js';

	let { data } = $props();
</script>

<BoardHeader boardId={BoardId.Bylaw} pageType="list" canCreatePost={data.canCreatePost} />
<BoardList postPage={data.postPage} filePresence={data.filePresence} />
