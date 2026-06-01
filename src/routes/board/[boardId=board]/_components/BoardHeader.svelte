<script lang="ts">
	import { page } from '$app/state';

	import Pen from '@lucide/svelte/icons/pencil';
	import List from '@lucide/svelte/icons/text';

	import LinkButton from '$components/LinkButton.svelte';
	import { hasMinRole } from '$lib/common/permission';

	const user = JSON.parse(page.data.user);

	let { pageType } = $props();
	const boardId = $derived(page.params.boardId);
</script>

<header class="container-col module_head">
	{#if boardId === 'free'}
		<h1>자유게시판</h1>
	{:else if boardId === 'notice'}
		<h1>공지사항</h1>
	{:else if boardId === 'bylaw'}
		<h1>회칙·세칙</h1>
	{/if}

	<div class="container">
		{#if boardId === 'free'}
			<p>구성원들과 자유로운 대화를 나눠보세요</p>
		{:else if boardId === 'notice'}
			<p>학생회의 공지사항을 한눈에 확인하세요</p>
		{:else if boardId === 'bylaw'}
			<p>총학생회의 회칙과 세칙을 확인하세요</p>
		{/if}
		{#if pageType === 'list' && (boardId === 'free' || ((boardId === 'notice' || boardId === 'bylaw') && hasMinRole(user, 'moderator')))}
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
		width: stretch;

		div {
			width: stretch;
			justify-content: space-between;
		}
	}
</style>
