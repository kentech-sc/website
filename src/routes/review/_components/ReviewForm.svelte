<script lang="ts">
	import CommonForm from '$lib/components/CommonForm.svelte';
	import ReviewService from '$lib/review/service.js';
	import type { Review } from '$lib/review/types';
	import type { Professor } from '$lib/professor/types';
	import type { Course } from '$lib/course/types';

	let {
		professors,
		courses,
		review
	}: { professors: Professor[]; courses: Course[]; review?: Review } = $props();
</script>

{#snippet TermInputs()}
	<div class="container">
		<label for="year">학년도</label>
		<select id="year" name="year" required value={review?.year}>
			<option value="">선택</option>
			{#each Array.from({ length: new Date().getFullYear() - 2021 }, (_, i) => 22 + i) as year (year)}
				<option value={year}>{year}</option>
			{/each}
		</select>
		<label for="term">학기</label>
		<select id="term" name="term" required value={review?.term.toString()}>
			<option value="">선택</option>
			<option value="1">{ReviewService.translatedTerm[1]}</option>
			<option value="2">{ReviewService.translatedTerm[2]}</option>
			<option value="3">{ReviewService.translatedTerm[3]}</option>
			<option value="4">{ReviewService.translatedTerm[4]}</option>
		</select>
	</div>
{/snippet}

{#snippet CourseInputs()}
	<div class="container">
		<label for="courseId">강의 코드</label>
		<select id="courseId" name="courseId" required value={review?.courseId.toString()}>
			<option value="">선택</option>
			{#each courses as course (course._id)}
				<option value={course._id}>[{course.code}] {course.name}</option>
			{/each}
		</select>
		<label for="professorId">교수님</label>
		<select id="professorId" name="professorId" required value={review?.professorId.toString()}>
			<option value="">선택</option>
			{#each professors as professor (professor._id)}
				<option value={professor._id}>{professor.name} 교수님</option>
			{/each}
		</select>
	</div>
{/snippet}

{#snippet ScoreInputs()}
	<div class="container">
		<div>
			<label for="assignmentScore">과제 양 (적음:1~많음:10)</label>
			<input
				type="number"
				id="assignmentScore"
				name="assignmentScore"
				min="1"
				max="10"
				required
				value={review?.score.assignment}
			/>
		</div>
		<div>
			<label for="lectureScore">강의 난이도 (쉬움:1~어려움:10)</label>
			<input
				type="number"
				id="lectureScore"
				name="lectureScore"
				min="1"
				max="10"
				required
				value={review?.score.lecture}
			/>
		</div>
		<div>
			<label for="examScore">시험 횟수 (적음:1~많음:10)</label>
			<input
				type="number"
				id="examScore"
				name="examScore"
				min="1"
				max="10"
				required
				value={review?.score.exam}
			/>
		</div>
	</div>
{/snippet}

<section class="module">
	<CommonForm
		actionName={review ? 'editReview' : 'createReview'}
		formName={review ? 'editReview' : 'createReview'}
	>
		<div id="form-div" class="container-col">
			{@render CourseInputs()}
			{@render TermInputs()}
			<label for="title">한줄평</label>
			<input type="text" id="title" name="title" required value={review?.title} />
			{@render ScoreInputs()}
			<label for="comment">기타</label>
			<textarea id="comment" name="comment">{review?.comment}</textarea>
			<button type="submit">{review ? '수정하기' : '평가하기'}</button>
		</div>
	</CommonForm>
</section>

<style lang="scss">
	#form-div {
		width: stretch;
		align-items: flex-start;

		& > *:not(label, button) {
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
