<script lang="ts">
	import type { Review } from '$lib/review/types.js';
	import GeneralUtils from '$lib/general/utils.js';

	let { data } = $props();
	const reviews = $state<Review[]>(JSON.parse(data?.reviews || '[]'));
</script>

<div id="layout" class="container-col">
	<header class="container module">
		<h1>강의 평가</h1>
		<a href="/review/_new">강의/교수 추가하기</a>
		<a href="/review/new">평가하기</a>
	</header>

	<section class="module">
		<p>(대충 주의사항)</p>
	</section>

	<section class="container-col module">
		<table>
			<colgroup>
				<col style="width:55%" />
				<col style="width:15%" />
				<col style="width:15%" />
				<col style="width:15%" />
			</colgroup>
			<thead>
				<tr>
					<th>강의명</th>
					<th>교수님</th>
					<th>작성자</th>
					<th>작성일</th>
				</tr>
			</thead>
			<tbody>
				{#each reviews as review (review._id)}
					<tr>
						<td><a href={`/review/${review._id}`}>{review.courseName}</a></td>
						<td>{review.professorName}</td>
						<td>{review.displayName}</td>
						<td>{GeneralUtils.parseDate(review.createdAt, 'date')}</td>
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

		td:nth-child(4) {
			text-align: center;
		}
	}
</style>
