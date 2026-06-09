<script lang="ts">
	import { page } from '$app/state';

	import CommonListBtnModule from '$components/CommonListBtnModule.svelte';
	import FileAttachmentIcons from '$components/FileAttachmentIcons.svelte';
	import MobileListItem from '$components/MobileListItem.svelte';

	import type { FilePresence, Page } from '$lib/types/general.type.js';
	import type { Post } from '$lib/types/post.type.js';

	import { parseDate, parseRelativeDate } from '$lib/shared/utils.js';

	let {
		postPage,
		filePresence,
	}: { postPage: Page<Post>; filePresence: FilePresence } = $props();

	const boardId = $derived(page.params.boardId);
</script>

{#snippet ListItem(post: Post)}
	{@const fp = filePresence[post._id.toString()]}
	<tr>
		<td>
			<a href={`/board/${boardId}/${post._id}`}>
				<span class="ellipsis">{post.title}</span>
				<FileAttachmentIcons hasImage={fp?.hasImage} hasFile={fp?.hasFile} />
				<span>[{post.commentCnt}]</span>
			</a>
		</td>
		<td>{post.displayName}</td>
		<td>{parseDate(post.createdAt)}</td>
		<td>{post.viewCnt}</td>
		<td>{post.likeCnt}</td>
	</tr>
{/snippet}

<section class="container-col module">
	<table>
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
				<th>조회수</th>
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

<section class="container-col module mobile-list">
	{#each postPage.items as post (post._id)}
		<MobileListItem href={`/board/${boardId}/${post._id}`}>
			{#snippet row1()}
				<span class="title">{post.title}</span>
				<FileAttachmentIcons
					hasImage={filePresence[post._id.toString()]?.hasImage}
					hasFile={filePresence[post._id.toString()]?.hasFile}
				/>
				{#if post.commentCnt > 0}
					<span class="comment-cnt">[{post.commentCnt}]</span>
				{/if}
			{/snippet}
			{#snippet row2()}
				<span class="meta">{post.displayName} · 조회 {post.viewCnt} · 좋아요 {post.likeCnt}</span>
				<span class="time">{parseRelativeDate(post.createdAt)}</span>
			{/snippet}
		</MobileListItem>
	{/each}
	<CommonListBtnModule currentPage={postPage.currentPage} totalPages={postPage.totalPages} />
</section>

<style lang="scss">
	table {
		width: 100%;

		th {
			word-break: keep-all;
		}

		td,
		th {
			padding: 0.5rem;
			background-color: white;
			border: none;
		}

		td:first-child > a {
			display: grid;
			justify-content: start;
			align-items: center;
			grid-template-columns: auto auto auto;
			gap: 0.2rem;
		}

		thead > tr > th {
			border-bottom: solid var(--gray-border) 0.1rem;
		}

		tbody {
			tr {
				border-bottom: solid var(--gray-border) 0.1rem;
			}

			tr:hover > td {
				background-color: var(--gray-bg);
			}
		}

		td:nth-child(n) {
			text-align: center;
		}

		td:first-child {
			text-align: left;
			font-weight: bold;

			a {
				color: black;

				span:last-child {
					color: var(--secondary);
					font-size: 0.8rem;
				}
			}
		}
	}

	.mobile-list {
		display: none;
	}

	@media (max-width: 768px) {
		section:not(.mobile-list) {
			display: none;
		}

		.mobile-list {
			display: flex;
			padding: 0;

			:global(.comment-cnt) {
				flex-shrink: 0;
				color: var(--secondary);
				font-size: 0.9rem;
				font-weight: bold;
			}
		}
	}
</style>
