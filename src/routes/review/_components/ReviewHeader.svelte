<script lang="ts">
	import Pen from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import List from '@lucide/svelte/icons/text';

	import CommonHeader from '$components/CommonHeader.svelte';

	let {
		pageType,
		canCreateReview = false,
		canManageCatalog = false
	}: {
		pageType: string;
		canCreateReview?: boolean;
		canManageCatalog?: boolean;
	} = $props();

	const title = '강의평가';
	const description = '수강했던 강의에 대한 솔직한 후기를 남겨주세요';
</script>

<CommonHeader {title} {description}>
	{#if pageType === 'list'}
		{#if canManageCatalog}
			<a href="/course/new" class="link-btn">
				<Plus size="0.8rem" />
				<span>추가하기</span>
			</a>
		{/if}
		{#if canCreateReview}
			<a href="/review/new" class="link-btn">
				<Pen size="0.8rem" />
				<span>평가하기</span>
			</a>
		{/if}
	{:else if pageType === 'new' || pageType === 'edit' || pageType === 'detail'}
		<a href="/review" class="link-btn">
			<List size="0.8rem" />
			<span>목록</span>
		</a>
	{/if}
</CommonHeader>
