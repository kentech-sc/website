<script lang="ts">
	let { pageType } = $props();
</script>

<header class="container-col module">
	<div class="container">
		<h1>강의 평가</h1>
		{#if pageType === 'list'}
			<a href="/course/new">강의/교수 추가하기</a>
			<a href="/review/new">평가하기</a>
		{:else if pageType === 'edit'}
			<a href="/review">목록</a>
		{:else if pageType === 'new'}
			<a href="/review">목록</a>
		{:else if pageType === 'detail'}
			<a href="/review">목록</a>
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
