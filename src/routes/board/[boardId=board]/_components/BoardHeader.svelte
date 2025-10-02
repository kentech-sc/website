<script lang="ts">
	import { page } from '$app/state';

	let { pageType } = $props();
	const boardId = $derived(page.params.boardId);
</script>

<header class="container-col module">
	<div class="container">
		{#if boardId === 'free'}
			<h1>자유게시판</h1>
		{:else if boardId === 'notice'}
			<h1>공지사항</h1>
		{/if}

		{#if pageType === 'list'}
			<a href="/board/{boardId}/new">글쓰기</a>
		{:else if pageType === 'new'}
			<a href="/board/{boardId}">목록</a>
		{:else if pageType === 'edit'}
			<a href="/board/{boardId}">목록</a>
		{:else if pageType === 'detail'}
			<a href="/board/{boardId}">목록</a>
		{/if}
	</div>
	<hr />
	<p>(대충 주의사항)</p>
</header>

<style lang="scss">
	header {
		align-items: flex-start;

		div {
			width: stretch;
			justify-content: space-between;
		}
	}
</style>
