<script lang="ts">
	import { page } from '$app/state';

	import Pen from '@lucide/svelte/icons/pencil';
	import List from '@lucide/svelte/icons/text';

	import LinkButton from '$components/common/LinkButton.svelte'

	let { pageType } = $props();
	const boardId = $derived(page.params.boardId);
</script>

<header class="container-col module_head">
	{#if boardId === 'free'}
		<h1>자유게시판</h1>
	{:else if boardId === 'notice'}
		<h1>공지사항</h1>
	{/if}

	<div class="container">
		<p>구성원들과 자유로운 대화를 나눠보세요</p>
		{#if pageType === 'list'}
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
