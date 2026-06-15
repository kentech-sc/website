<script lang="ts">
	import Pen from '@lucide/svelte/icons/pencil';
	import List from '@lucide/svelte/icons/text';

	import CommonHeader from '$components/CommonHeader.svelte';

	let { pageType, canCreatePetition = false }: { pageType: string; canCreatePetition?: boolean } =
		$props();

	const title = '청원';
	const description = '더 나은 학교를 위해 소중한 의견을 제안해 주세요';
</script>

<CommonHeader {title} {description}>
	{#if pageType === 'list' && canCreatePetition}
		<a href="/petition/new" class="link-btn">
			<Pen size="0.8rem" />
			<span>청원하기</span>
		</a>
	{:else if pageType === 'new' || pageType === 'detail'}
		<a href="/petition" class="link-btn">
			<List size="0.8rem" />
			<span>목록</span>
		</a>
	{/if}
</CommonHeader>
