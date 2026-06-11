<script lang="ts">
	import Pen from '@lucide/svelte/icons/pencil';
	import List from '@lucide/svelte/icons/text';

	import LinkButton from '$components/LinkButton.svelte';

	let { pageType, canCreatePetition = false }: { pageType: string; canCreatePetition?: boolean } =
		$props();
</script>

<header class="container-col module_head module-head-layout">
	<h1>청원</h1>

	<div class="module-head-row">
		<p class="module-head-description">더 나은 학교를 위해 소중한 의견을 제안해 주세요</p>

		{#if pageType === 'list' && canCreatePetition}
			<div class="module-head-actions">
				<LinkButton href="/petition/new">
					<Pen size="1rem" />
					<span>청원하기</span>
				</LinkButton>
			</div>
		{:else if pageType === 'new' || pageType === 'detail'}
			<div class="module-head-actions">
				<LinkButton href="/petition">
					<List size="1rem" />
					<span>목록</span>
				</LinkButton>
			</div>
		{/if}
	</div>

	<hr />
</header>
