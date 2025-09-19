<script lang="ts">
	import BoardForm from '../boardForm.svelte';
</script>

{#snippet HeaderModule()}
	<header class="container module">
		<h1>자유게시판</h1>
		<a href="/board">목록</a>
	</header>
{/snippet}

{#snippet NoticeModule()}
	<section class="module">
		<p>(대충 주의사항)</p>
	</section>
{/snippet}

{@render HeaderModule()}
{@render NoticeModule()}
<section class="container module">
	<BoardForm />
</section>

<style lang="scss">
	section {
		width: stretch;
		margin: 0.5rem;
	}

	header {
		width: stretch;
		margin: 0.5rem;
		justify-content: space-between;
	}
</style>
