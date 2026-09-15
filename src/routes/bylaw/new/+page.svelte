<script lang="ts">
	import BoardForm from '../../board/_components/BoardForm.svelte';
	import BoardHeader from '../../board/_components/BoardHeader.svelte';

	import { BoardId } from '$lib/types/board.type.js';

	let { data } = $props();
</script>

<BoardHeader boardId={BoardId.Bylaw} pageType="new" />
<BoardForm user={data.user} />
