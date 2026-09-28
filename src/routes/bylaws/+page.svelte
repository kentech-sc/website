<script lang="ts">
	import BoardHeader from '../boards/_components/BoardHeader.svelte';
	import BoardList from '../boards/_components/BoardList.svelte';

	import { BoardId } from '$lib/types/board.type.js';

	let { data } = $props();
</script>

<section class="page">
	<BoardHeader boardId={BoardId.Bylaw} pageType="list" canCreatePost={data.canCreatePost} />
	<BoardList postPage={data.postPage} filePresence={data.filePresence} />
</section>
