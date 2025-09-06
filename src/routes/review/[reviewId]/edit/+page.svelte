<script lang="ts">
	import CommonForm from '$lib/assets/commonForm.svelte';
	import type { Course } from '$lib/course/types.js';
	import type { Professor } from '$lib/professor/types.js';
	import type { Review } from '$lib/review/types.js';
	import ReviewService from '$lib/review/service.js';

	let { data } = $props();
	let courses = $state<Course[]>(JSON.parse(data?.courses || '[]'));
	let professors = $state<Professor[]>(JSON.parse(data?.professors || '[]'));
	let review = $state<Review>(JSON.parse(data?.review || '{}'));
</script>

{#snippet HeaderModule()}
	<header class="container module">
		<h1>강의 평가</h1>
		<a href="/review">목록</a>
	</header>
{/snippet}

{#snippet TermInputs()}
	<div class="container">
		<label for="year">학년도</label>
		<select id="year" name="year" value={review.year}>
			<option value="">선택</option>
			{#each Array.from({ length: new Date().getFullYear() - 2021 }, (_, i) => 22 + i) as year (year)}
				<option value={year}>{year}</option>
			{/each}
		</select>
		<label for="term">학기</label>
		<select id="term" name="term" value={review.term.toString()}>
			<option value="">선택</option>
			{#each Object.entries(ReviewService.translatedTerm) as [key, value] (key)}
				<option value={key}>{value}</option>
			{/each}
		</select>
	</div>
{/snippet}

{#snippet CourseInputs()}
	<div class="container">
		<label for="courseId">강의 코드</label>
		<select id="courseId" name="courseId" value={review.courseId}>
			<option value="">선택</option>
			{#each courses as course (course._id)}
				<option value={course._id}>[{course.code}] {course.name}</option>
			{/each}
		</select>
		<label for="professorId">교수님</label>
		<select id="professorId" name="professorId" value={review.professorId}>
			<option value="">선택</option>
			{#each professors as professor (professor._id)}
				<option value={professor._id}>{professor.name} 교수님</option>
			{/each}
		</select>
	</div>
{/snippet}

{#snippet ScoreInputs()}
	<div class="container">
		<label for="assignmentScore">과제</label>
		<input
			type="number"
			id="assignmentScore"
			name="assignmentScore"
			value={review.score.assignment}
		/>
		<label for="lectureScore">강의</label>
		<input type="number" id="lectureScore" name="lectureScore" value={review.score.lecture} />
		<label for="examScore">시험</label>
		<input type="number" id="examScore" name="examScore" value={review.score.exam} />
	</div>
{/snippet}

{#snippet FormModule()}
	<CommonForm actionName="editReview" formName="editReview">
		<div id="form-div" class="container-col">
			{@render CourseInputs()}
			{@render TermInputs()}
			<label for="title">한줄평</label>
			<input type="text" id="title" name="title" value={review.title} />
			{@render ScoreInputs()}
			<label for="comment">기타</label>
			<textarea id="comment" name="comment">{review.comment}</textarea>
			<button type="submit">수정하기</button>
		</div>
	</CommonForm>
{/snippet}

{@render HeaderModule()}

<section class="module">
	<p>(대충 주의사항)</p>
</section>

<section class="container-col module" id="form-section">
	{@render FormModule()}
</section>

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

	#form-div {
		width: stretch;
		align-items: flex-start;

		& > *:not(label) {
			margin-bottom: 1rem;
		}

		label {
			word-break: keep-all;
			white-space: nowrap;
		}

		input {
			width: stretch;
		}

		input[type='number'],
		select {
			width: stretch;
			margin-left: 0.5rem;
			margin-right: 1.5rem;
		}

		textarea {
			width: stretch;
			height: 10vh;
			resize: vertical;
		}
	}
</style>
