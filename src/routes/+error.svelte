<script lang="ts">
	import { page } from '$app/state';

	let error = $derived(page.error);
</script>

<div>
	<h2>오류가 발생했습니다.</h2>
	<p>문제가 계속되면 아래 메시지와 함께 관리자에게 알려 주세요.</p>
	{#if error}
		<p><span style="color: red">[{error.status}]</span> {error.message}</p>
	{/if}
	<a href="/" class="btn-anchor">메인 페이지로 돌아가기</a>
</div>

<style lang="scss">
	div {
		padding: 1.6rem;
		text-align: center;

		p {
			margin: 0.6rem;
		}
	}
</style>
