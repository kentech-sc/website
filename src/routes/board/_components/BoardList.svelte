<script lang="ts">
	import CommonListBtnModule from '$lib/components/CommonListBtnModule.svelte';
	import type { Post } from '$lib/board/types.js';
	import GeneralUtils from '$lib/general/utils.js';

	let { posts, toId, fromId } = $props();
</script>

{#snippet ListItem(post: Post)}
	<tr>
		<td><a href={`/board/${post._id}`}>{post.title} [{post.commentCnt}]</a></td>
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
	<CommonListBtnModule pageName="board" {toId} {fromId} />
</section>

<style lang="scss">
	table {
		width: stretch;

		td,
		th {
			padding: 0.5rem;
		}

		td:nth-child(n) {
			text-align: center;
		}

		td:first-child {
			text-align: left;
		}
	}
</style>
