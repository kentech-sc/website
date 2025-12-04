<script lang="ts">
	import { page } from '$app/state';

	import Pen from '@lucide/svelte/icons/pencil';
	import List from '@lucide/svelte/icons/text';

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
				<a href="/board/{boardId}/new"><Pen size="1rem"/>&nbsp;글쓰기</a>
			{:else if pageType === 'new'}
				<a href="/board/{boardId}"><List size="1rem"/>&nbsp;목록</a>
			{:else if pageType === 'edit'}
				<a href="/board/{boardId}"><List size="1rem"/>&nbsp;목록</a>
			{:else if pageType === 'detail'}
				<a href="/board/{boardId}"><List size="1rem"/>&nbsp;목록</a>
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
			a {
				display: flex;
				align-items: center;
				padding: 0.3rem 0.5rem;
				background-color: var(--secondary);
				color: var(--tertiary-text);
				border-radius: 0.25rem;
			}
			a:hover{
				text-decoration: none;
			}
		}
	}

	p {
		font-size: 0.9rem;
		font-weight: bold;
	}
</style>
