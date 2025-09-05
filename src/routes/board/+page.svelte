<script lang="ts">
	import type { Post } from '$lib/board/types.js';
	import GeneralUtils from '$lib/general/utils.js';

	let { data } = $props();
	const posts = $state<Post[]>(JSON.parse(data?.posts || '[]'));
</script>

{#snippet HeaderModule()}
	<header class="container module">
		<h1>자유게시판</h1>
		<a href="/board/new">글쓰기</a>
	</header>
{/snippet}

{#snippet NoticeModule()}
	<section class="module">
		<p>(대충 주의사항)</p>
	</section>
{/snippet}

{#snippet ListItem(post: Post)}
	<tr>
		<td><a href={`/board/${post._id}`}>{post.title}</a></td>
		<td>{post.displayName}</td>
		<td>{GeneralUtils.parseDate(post.createdAt)}</td>
		<td>{post.viewCnt}</td>
		<td>{post.likeCnt}</td>
	</tr>
{/snippet}

{#snippet ListModule()}
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
				{#each posts as post (post._id)}{@render ListItem(post)}{/each}
			</tbody>
		</table>
	</section>
{/snippet}

{@render HeaderModule()}
{@render NoticeModule()}
{@render ListModule()}

<style lang="scss">
	section {
		width: stretch;
		margin: 0.5rem;
	}

	header {
		width: stretch;
		margin: 0.5rem;
		justify-content: space-between;
	}

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
