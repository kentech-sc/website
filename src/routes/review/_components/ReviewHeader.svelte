<script lang="ts">
	import Pen from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import List from '@lucide/svelte/icons/text';

	import LinkButton from '$components/LinkButton.svelte';

	let {
		pageType,
		canCreateReview = false,
		canManageCatalog = false
	}: {
		pageType: string;
		canCreateReview?: boolean;
		canManageCatalog?: boolean;
	} = $props();
</script>

<header class="container-col module_head module-head-layout">
	<h1>강의 평가</h1>

	<div class="module-head-row">
		<p class="module-head-description">수강했던 강의에 대한 솔직한 후기를 남겨주세요</p>

		<div class="module-head-actions">
			{#if pageType === 'list'}
				{#if canManageCatalog}
					<LinkButton href="/course/new">
						<Plus size="0.8rem" />
						<span>강의/교수 추가</span>
					</LinkButton>
				{/if}
				{#if canCreateReview}
					<LinkButton href="/review/new">
						<Pen size="0.8rem" />
						<span>평가하기</span>
					</LinkButton>
				{/if}
			{:else if pageType === 'new' || pageType === 'edit' || pageType === 'detail'}
				<LinkButton href="/review">
					<List size="0.8rem" />
					<span>목록</span>
				</LinkButton>
			{/if}
		</div>
	</div>

	<hr />
</header>
