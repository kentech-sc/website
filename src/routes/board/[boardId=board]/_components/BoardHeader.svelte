<script lang="ts">
	import Pen from '@lucide/svelte/icons/pencil';
	import List from '@lucide/svelte/icons/text';

	import { page } from '$app/state';
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

<header class="container-col module_head module-head-layout">
	<h1>{title}</h1>

	<div class="module-head-row">
		<p class="module-head-description">{description}</p>

		{#if pageType === 'list' && canCreatePost}
			<div class="module-head-actions">
				<LinkButton href="/board/{boardId}/new">
					<Pen size="1rem" />
					<span>글쓰기</span>
				</LinkButton>
			</div>
		{:else if pageType === 'new' || pageType === 'edit' || pageType === 'detail'}
			<div class="module-head-actions">
				<LinkButton href="/board/{boardId}">
					<List size="1rem" />
					<span>목록</span>
				</LinkButton>
			</div>
		{/if}
	</div>

	<hr />
</header>
