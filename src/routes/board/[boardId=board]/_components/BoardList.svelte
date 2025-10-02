<script lang="ts">
	import { page } from '$app/state';
	import CommonListBtnModule from '$lib/components/CommonListBtnModule.svelte';
	import type { Post } from '$lib/board/types.js';
	import GeneralUtils from '$lib/general/utils.js';

	let { posts, toId, fromId } = $props();

	const boardId = $derived(page.params.boardId);
</script>

{#snippet ListItem(post: Post)}
	<tr>
		<td><a href={`/board/${boardId}/${post._id}`}>{post.title} <span>[{post.commentCnt}]</span></a></td>
		<td>{post.displayName}</td>
		<td>{GeneralUtils.parseDate(post.createdAt)}</td>
		<td>{post.viewCnt}</td>
		<td>{post.likeCnt}</td>
	</tr>
{/snippet}

<section class="container-col module">
	<table>
		<colgroup>
			<col style="width:50%" />
			<col style="width:16%" />
			<col style="width:20%" />
			<col style="width:7%" />
			<col style="width:7%" />
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
			{#each posts as post (post._id)}
				{@render ListItem(post)}
			{/each}
		</tbody>
	</table>
	<CommonListBtnModule pageName="board/{boardId}" {toId} {fromId} />
</section>

<style lang="scss">
	table {
		width: stretch;

		td,
		th {
			padding: 0.5rem;
			background-color: white;
			border: none;
		}

		thead > tr > th {
			border-bottom: solid var(--gray-border) 0.1rem;
		}

		tbody > tr:nth-child(2n) > td {
			background-color: var(--gray-bg);
		}

		td:nth-child(n) {
			text-align: center;
		}

		td:first-child {
			text-align: left;
		}

		td:first-child {
			font-weight: bold;
			a {
				color: black;

				span {
					color: var(--secondary);
					font-size: 0.8rem;
				}
			}
		}
	}
</style>
