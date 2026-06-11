<script lang="ts">
	import type { FilePresence, Page } from '$lib/types/general.type.js';
	import type { Post } from '$lib/types/post.type.js';

	import { page } from '$app/state';
	import CommonListBtnModule from '$components/CommonListBtnModule.svelte';
	import FileAttachmentIcons from '$components/FileAttachmentIcons.svelte';
	import MobileListItem from '$components/MobileListItem.svelte';
	import { parseDate, parseRelativeDate } from '$lib/shared/utils.js';

	let { postPage, filePresence }: { postPage: Page<Post>; filePresence: FilePresence } = $props();

	const boardId = $derived(page.params.boardId);
</script>

{#snippet ListItem(post: Post)}
	{@const fp = filePresence[post._id.toString()]}
	<tr>
		<td>
			<a class="board-title-link" href={`/board/${boardId}/${post._id}`}>
				<span class="ellipsis">{post.title}</span>
				<FileAttachmentIcons hasImage={fp?.hasImage} hasFile={fp?.hasFile} />
				{#if post.commentCnt > 0}
					<span class="board-comment-count">[{post.commentCnt}]</span>
				{/if}
			</a>
		</td>
		<td>{post.displayName}</td>
		<td>{parseDate(post.createdAt)}</td>
		<td>{post.viewCnt}</td>
		<td>{post.likedBy.length}</td>
	</tr>
{/snippet}

<section class="container-col module desktop-list-shell">
	<table class="data-table">
		<colgroup>
			<col style="width:60%" />
			<col style="width:12%" />
			<col style="width:16%" />
			<col style="width:6%" />
			<col style="width:6%" />
		</colgroup>
		<thead>
			<tr>
				<th>제목</th>
				<th>작성자</th>
				<th>작성일</th>
				<th>조회</th>
				<th>좋아요</th>
			</tr>
		</thead>
		<tbody>
			{#each postPage.items as post (post._id)}
				{@render ListItem(post)}
			{/each}
		</tbody>
	</table>
	<CommonListBtnModule currentPage={postPage.currentPage} totalPages={postPage.totalPages} />
</section>

<section class="container-col module mobile-list-shell">
	{#each postPage.items as post (post._id)}
		<MobileListItem href={`/board/${boardId}/${post._id}`}>
			{#snippet row1()}
				<span class="title">{post.title}</span>
				<FileAttachmentIcons
					hasImage={filePresence[post._id.toString()]?.hasImage}
					hasFile={filePresence[post._id.toString()]?.hasFile}
				/>
				{#if post.commentCnt > 0}
					<span class="board-mobile-comment-count">[{post.commentCnt}]</span>
				{/if}
			{/snippet}
			{#snippet row2()}
				<span class="meta"
					>{post.displayName} | 조회 {post.viewCnt} | 좋아요 {post.likedBy.length}</span
				>
				<span class="time">{parseRelativeDate(post.createdAt)}</span>
			{/snippet}
		</MobileListItem>
	{/each}
	<CommonListBtnModule currentPage={postPage.currentPage} totalPages={postPage.totalPages} />
</section>

<style lang="scss">
	.board-title-link {
		display: grid;
		justify-content: start;
		align-items: center;
		grid-template-columns: auto auto auto;
		gap: 0.2rem;
	}

	.board-comment-count {
		color: var(--secondary);
		font-size: 0.7rem;
	}

	.mobile-list-shell {
		:global(.board-mobile-comment-count) {
			flex-shrink: 0;
			color: var(--secondary);
			font-size: 0.7rem;
			font-weight: bold;
		}
	}
</style>
