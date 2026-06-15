<script lang="ts">
	import Pen from '@lucide/svelte/icons/pencil';
	import List from '@lucide/svelte/icons/text';

	import { page } from '$app/state';
	import CommonHeader from '$components/CommonHeader.svelte';

	let { pageType, canCreatePost = false }: { pageType: string; canCreatePost?: boolean } = $props();

	const boardId = $derived(page.params.boardId);

	const title = $derived.by(() => {
		if (boardId === 'free') return '자유게시판';
		if (boardId === 'notice') return '공지사항';
		if (boardId === 'bylaw') return '회칙·세칙';
		return '앗!';
	});

	const description = $derived.by(() => {
		if (boardId === 'free') return '구성원들과 자유로운 대화를 나눠보세요';
		if (boardId === 'notice') return '학생회의 공지사항을 한눈에 확인하세요';
		if (boardId === 'bylaw') return '총학생회의 회칙과 세칙을 확인하세요';
		return '존재하지 않는 게시판입니다.';
	});
</script>

<CommonHeader {title} {description}>
	{#if pageType === 'list' && canCreatePost}
		<a href="/board/{boardId}/new" class="link-btn">
			<Pen size="0.8rem" />
			<span>글쓰기</span>
		</a>
	{:else if pageType === 'new' || pageType === 'edit' || pageType === 'detail'}
		<a href="/board/{boardId}" class="link-btn">
			<List size="0.8rem" />
			<span>목록</span>
		</a>
	{/if}
</CommonHeader>
