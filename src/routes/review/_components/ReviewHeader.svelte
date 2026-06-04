<script lang="ts">
	import List from '@lucide/svelte/icons/text';
	import Pen from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';

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

<header class="container-col module_head">
	<h1>강의 평가</h1>

	<div class="container">
		<p>수강했던 강의에 대한 솔직한 후기를 남겨주세요</p>

		<div class="btn-group">
			{#if pageType === 'list'}
				{#if canManageCatalog}
					<LinkButton href="/course/new">
						<Plus size="1rem" />
						<span>강의/교수 추가</span>
					</LinkButton>
				{/if}
				{#if canCreateReview}
					<LinkButton href="/review/new">
						<Pen size="1rem" />
						<span>평가하기</span>
					</LinkButton>
				{/if}
			{:else if pageType === 'new' || pageType === 'edit' || pageType === 'detail'}
				<LinkButton href="/review">
					<List size="1rem" />
					<span>목록</span>
				</LinkButton>
			{/if}
		</div>
	</div>
	<hr />
</header>

<style lang="scss">
	header {
		align-items: flex-start;
		width: 100%;

		.container {
			width: 100%;
			justify-content: flex-start;
			align-items: center;
			flex-wrap: wrap;
			gap: 0.5rem;
		}
	}

	p {
		font-size: 0.9rem;
		font-weight: bold;
		margin: 0;
	}

	.btn-group {
		display: flex;
		gap: 0.5rem;
		white-space: nowrap;
		margin-left: auto;
	}
</style>

