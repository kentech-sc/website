<script lang="ts">
	let { pageType } = $props();
</script>

<header class="container-col module">
	<div class="container">
		<h1>자유게시판</h1>
		{#if pageType === 'list'}
			<a href="/board/new">글쓰기</a>
		{:else if pageType === 'new'}
			<a href="/board">목록</a>
		{:else if pageType === 'edit'}
			<a href="/board">목록</a>
		{:else if pageType === 'detail'}
			<a href="/board">목록</a>
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
