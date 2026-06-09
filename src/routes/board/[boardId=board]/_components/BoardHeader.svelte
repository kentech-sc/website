<script lang="ts">
	import { page } from '$app/state';

	import Pen from '@lucide/svelte/icons/pencil';
	import List from '@lucide/svelte/icons/text';

	import LinkButton from '$components/LinkButton.svelte';

	let { pageType, canCreatePost = false }: { pageType: string; canCreatePost?: boolean } = $props();

	const boardId = $derived(page.params.boardId);

	const title = $derived.by(() => {
		if (boardId === 'free') return '자유게시판';
		if (boardId === 'notice') return '공지사항';
		return '회칙·세칙';
	});

	const description = $derived.by(() => {
		if (boardId === 'free') return '구성원들과 자유로운 대화를 나눠보세요';
		if (boardId === 'notice') return '학생회의 공지사항을 한눈에 확인하세요';
		return '총학생회의 회칙과 세칙을 확인하세요';
	});
</script>

<header class="container-col module_head">
	<h1>{title}</h1>

	<div class="container">
		<p>{description}</p>
		{#if pageType === 'list' && canCreatePost}
			<LinkButton href="/board/{boardId}/new">
				<Pen size="1rem" />
				<span>글쓰기</span>
			</LinkButton>
		{:else if pageType === 'new' || pageType === 'edit' || pageType === 'detail'}
			<LinkButton href="/board/{boardId}">
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

		div {
			width: 100%;
			justify-content: space-between;
		}
	}
</style>
