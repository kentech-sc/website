<script lang="ts">
	import type { Review } from '$lib/review/types.js';
	import GeneralUtils from '$lib/general/utils.js';
	import ReviewService from '$lib/review/service.js';
	import type { Course } from '$lib/course/types.js';
	import type { Professor } from '$lib/professor/types.js';

	let { data } = $props();
	const allReviews = $state<Review[]>(JSON.parse(data?.reviews || '[]'));

	let selectedCourse = $state<string>('');
	let selectedProfessor = $state<string>('');

	let reviews = $derived.by<Review[]>(() => {
		return allReviews.filter((review) => {
			if (selectedCourse && review.courseId.toString() !== selectedCourse) return false;
			if (selectedProfessor && review.professorId.toString() !== selectedProfessor) return false;
			return true;
		});
	});

	const courses = $state<Course[]>(JSON.parse(data?.courses || '[]'));
	const professors = $state<Professor[]>(JSON.parse(data?.professors || '[]'));


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
		<div class="container" id="filter-div">
			<div>
				<label for="course">강의</label>
				<select id="course" bind:value={selectedCourse}>
					<option value="">전체</option>
					{#each courses as course (course._id)}
						<option value={course._id}>[{course.code}] {course.name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="professor">교수</label>
				<select id="professor" bind:value={selectedProfessor}>
					<option value="">전체</option>
					{#each professors as professor (professor._id)}
						<option value={professor._id}>{professor.name} 교수님</option>
					{/each}
				</select>
			</div>
		</div>
		<table>
			<colgroup>
				<col style="width:55%" />
				<col style="width:15%" />
				<col style="width:15%" />
				<col style="width:15%" />
			</colgroup>
			<thead>
				<tr>
					<th>한줄평</th>
					<th>교수님</th>
					<th>작성자</th>
					<th>작성일</th>
				</tr>
			</thead>
			<tbody>
				{#if reviews.length === 0}
					<tr>
						<td colspan="4">작성된 평가가 없습니다.</td>
					</tr>
				{:else}
					{#each reviews as review (review._id)}
						<tr>
							<td><a href={`/review/${review._id}`}>"{review.title}"</a></td>
							<td>{review.professorName}</td>
							<td>{review.year}학년도 {ReviewService.translatedTerm[review.term]}학기</td>
							<td>{GeneralUtils.parseDate(review.createdAt, 'date')}</td>
						</tr>
					{/each}
				{/if}
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

	#filter-div {
		width: 100%;
		justify-content: flex-start;

		div:nth-child(2) {
			margin-left: 1rem;
		}
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
