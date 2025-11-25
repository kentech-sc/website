<script lang="ts">
	import { page } from '$app/state';

	let error = $derived(page.error);
</script>

<div>
	<h2>에러가 발생했습니다...</h2>
	<p>발생 경위와 아래의 메시지를 캡쳐해 보내주시면 큰 도움이 됩니다.</p>
	{#if error}
		<p><span style="color: red">[{error.status}]</span> {error.message}</p>
	{/if}
	<a href="/" class="btn-anchor">메인 페이지로 돌아가기</a>
</div>

<style lang="scss">
	div {
		padding: 2rem;
		text-align: center;

		p {
			margin: 1rem;
		}
	}
</style>
