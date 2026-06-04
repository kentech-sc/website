<script lang="ts">
	import List from '@lucide/svelte/icons/text';
	import Pen from '@lucide/svelte/icons/pencil';

	import LinkButton from '$components/LinkButton.svelte';

	let { pageType, canCreatePetition = false }: { pageType: string; canCreatePetition?: boolean } =
		$props();
</script>

<header class="container-col module_head">
	<h1>청원</h1>
	<div class="container">
		<p>더 나은 학교를 위해 소중한 의견을 제안해 주세요</p>
		{#if pageType === 'list' && canCreatePetition}
			<LinkButton href="/petition/new">
				<Pen size="1rem" />
				<span>청원하기</span>
			</LinkButton>
		{:else if pageType === 'new' || pageType === 'detail'}
			<LinkButton href="/petition">
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
		width: 100%;

		.container {
			width: 100%;
			justify-content: space-between;
			align-items: center;
		}
	}
</style>

