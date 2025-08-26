<script lang="ts">
	import type { Course } from '$lib/courseReview/types.js';

	let { data } = $props();
	const courseArr = $state<Course[]>(JSON.parse(data?.courseArr || '[]'));
</script>

<div id="layout" class="container-col">
	<header class="container module">
		<h1>강의 평가</h1>
		<a href="/review/new">강의 추가하기</a>
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
					<th>리뷰 수</th>
					<th>평균</th>
				</tr>
			</thead>
			<tbody>
				{#each courseArr as course (course._id)}
					<tr>
						<td><a href={`/review/${course._id}`}>{course.title}</a></td>
						<td>{course.professor}</td>
						<td>{course.reviewCnt}</td>
						<td>{Math.round((course.totalScore / course.reviewCnt) * 100) / 100}</td>
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
