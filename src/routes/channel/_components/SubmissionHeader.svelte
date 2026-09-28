<script lang="ts">
	import Pen from '@lucide/svelte/icons/pencil';
	import List from '@lucide/svelte/icons/text';

	import { resolve } from '$app/paths';
	import PageHeader from '$components/PageHeader.svelte';

	let {
		mode,
		pageType,
		canCreate = false
	}: {
		mode: 'petition' | 'feedback';
		pageType: 'list' | 'new' | 'edit' | 'detail';
		canCreate?: boolean;
	} = $props();

	const title = $derived(mode === 'petition' ? '청원' : '문의·건의');
	const description = $derived(
		mode === 'petition'
			? '공동의 문제를 제안하고 구성원의 동의로 공식 답변을 요청하세요'
			: '각 조직에 질문을 남기거나 개선 의견을 제안하세요'
	);
	const listHref = $derived(
		mode === 'petition' ? resolve('/channel/petitions') : resolve('/channel/feedback')
	);
	const newHref = $derived(
		mode === 'petition' ? resolve('/channel/petitions/new') : resolve('/channel/feedback/new')
	);
</script>

<PageHeader {title} {description}>
	{#if pageType === 'list' && canCreate}
		<a href={newHref} class="ui-button is-primary">
			<Pen size="0.8rem" />
			<span>{mode === 'petition' ? '청원하기' : '작성하기'}</span>
		</a>
	{:else if pageType !== 'list'}
		<a href={listHref} class="ui-button is-primary">
			<List size="0.8rem" />
			<span>목록</span>
		</a>
	{/if}
</PageHeader>
