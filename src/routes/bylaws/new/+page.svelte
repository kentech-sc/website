<script lang="ts">
	import BoardForm from '../../boards/_components/BoardForm.svelte';
	import BoardHeader from '../../boards/_components/BoardHeader.svelte';

	import { BoardId } from '$lib/types/board.type.js';

	let { data } = $props();
</script>

<section class="page">
	<BoardHeader boardId={BoardId.Bylaw} pageType="new" />
	<BoardForm user={data.user} />
</section>
