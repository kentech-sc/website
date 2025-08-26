<script lang="ts">
	import type { Post } from '$lib/board/types.js';
	import GeneralUtils from '$lib/general/utils.js';

	let { data } = $props();
	const postArr = $state<Post[]>(JSON.parse(data?.postArr || '[]'));
</script>

<div id="layout" class="container-col">
	<header class="container module">
		<h1>자유게시판</h1>
		<a href="/board/new">글쓰기</a>
	</header>

	<section class="module">
		<p>(대충 주의사항)</p>
	</section>

	<section class="container-col module">
		<table>
			<colgroup>
				<col style="width:60%" />
				<col style="width:20%" />
				<col style="width:20%" />
			</colgroup>
			<thead>
				<tr>
					<th>제목</th>
					<th>작성자</th>
					<th>작성일</th>
				</tr>
			</thead>
			<tbody>
				{#each postArr as post (post._id)}
					<tr>
						<td><a href={`/board/${post._id}`}>{post.title}</a></td>
						<td>{post.userName}</td>
						<td>{GeneralUtils.parseDate(post.createdAt)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</div>

<style lang="scss">
	#layout {
		width: 100%;
	}

	section {
		width: 100%;
		margin: 0.5rem;
	}

	header {
		width: 100%;
		margin: 0.5rem;
		justify-content: space-between;
	}

	table {
		width: 100%;

		td,
		th {
			padding: 0.5rem;
		}

		td:first-child {
			text-align: left;
		}

		td:nth-child(2) {
			text-align: center;
		}

		td:nth-child(3) {
			text-align: center;
		}
	}
</style>
