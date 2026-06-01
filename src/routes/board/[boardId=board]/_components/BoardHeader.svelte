<script lang="ts">
	import { page } from '$app/state';

	import Pen from '@lucide/svelte/icons/pencil';
	import List from '@lucide/svelte/icons/text';

	import LinkButton from '$components/LinkButton.svelte';
	import { hasMinRole } from '$lib/common/permission';
	import { BOARD_CONFIG } from '$lib/types/board.type.js';
	import type { BoardId } from '$lib/types/board.type.js';

	const user = JSON.parse(page.data.user);

	let { pageType } = $props();
	const boardId = $derived(page.params.boardId as BoardId);
	const config = $derived(BOARD_CONFIG[boardId]);
</script>

<header class="container-col module_head">
	<h1>{config.label}</h1>

	<div class="container">
		<p>{config.description}</p>
		{#if pageType === 'list' && hasMinRole(user, config.writeMinRole)}
			<LinkButton href="/board/{boardId}/new">
				<Pen size="1rem" />
				<span>글쓰기</span>
			</LinkButton>
		{:else if pageType === 'new' || pageType === 'edit' || pageType === 'detail'}
			<LinkButton href="/board/{boardId}">
				<List size="1rem" />
				<span>목록</span>
			</LinkButton>
		{/if}
	</div>
	<hr />
</header>

<style lang="scss">
	header {
		align-items: flex-start;
		width: stretch;

		div {
			width: stretch;
			justify-content: space-between;
		}
	}
</style>
