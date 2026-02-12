<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';

	import * as ReviewService from '$lib/srv/review.srv.js';

	import type { Review } from '$lib/types/review.type.js';
	import type { Professor } from '$lib/types/prof.type.js';
	import type { Course } from '$lib/types/course.type.js';

	let {
		professors,
		courses,
		review
	}: { professors: Professor[]; courses: Course[]; review?: Review } = $props();

	let scores = $state({
        assignment: review?.score.assignment ?? 5,
        lecture: review?.score.lecture ?? 5,
        exam: review?.score.exam ?? 5
    });
</script>

{#snippet TermInputs()}
	<div class="container">
		<div class="select_group">
			<label for="year">개설 년도</label>
			<select id="year" name="year" required value={review?.year}>
				<option value="">선택</option>
				{#each Array.from({ length: new Date().getFullYear() - 2021 }, (_, i) => 22 + i) as year (year)}
					<option value={year}>{year}년도</option>
				{/each}
			</select>			
		</div>
		<div class="select_group">
			<label for="term">개설 학기</label>
			<select id="term" name="term" required value={review?.term.toString()}>
				<option value="">선택</option>
				<option value="1">{ReviewService.translatedTerm[1]}학기</option>
				<option value="2">{ReviewService.translatedTerm[2]}학기</option>
				<option value="3">{ReviewService.translatedTerm[3]}학기</option>
				<option value="4">{ReviewService.translatedTerm[4]}학기</option>
			</select>			
		</div>
	</div>
{/snippet}

{#snippet CourseInputs()}
	<div class="container">
		<div class="select_group">
			<label for="courseId">강의 코드</label>
			<select id="courseId" name="courseId" required value={review?.courseId.toString()}>
				<option value="">선택</option>
				{#each courses as course (course._id)}
					<option value={course._id}>[{course.code}] {course.name}</option>
				{/each}
			</select>
		</div>
		<div class="select_group">
			<label for="professorId">담당 교수님</label>
			<select id="professorId" name="professorId" required value={review?.professorId.toString()}>
				<option value="">선택</option>
				{#each professors as professor (professor._id)}
					<option value={professor._id}>{professor.name} 교수님</option>
				{/each}
			</select>
		</div>
	</div>
{/snippet}

{#snippet ScoreInputs()}
	<div class="container" id="score-container">
		<div class="score-item">
            <div class="label-row">
                <label for="assignmentScore">과제 양</label>
                <span class="current-value">{scores.assignment}</span>
            </div>
            <input
                type="range"
                id="assignmentScore"
                name="assignmentScore"
                min="0"
                max="10"
                step="1"
                bind:value={scores.assignment} 
            />
            <div class="range-guide">
                <span>적음(0)</span>
                <span>많음(10)</span>
            </div>
        </div>
		<div class="score-item">
            <div class="label-row">
                <label for="lectureScore">강의 난이도</label>
                <span class="current-value">{scores.lecture}</span>
            </div>
            <input
                type="range"
                id="lectureScore"
                name="lectureScore"
                min="0"
                max="10"
                step="1"
                bind:value={scores.lecture}
            />
            <div class="range-guide">
                <span>쉬움(0)</span>
                <span>어려움(10)</span>
            </div>
        </div>
		<div class="score-item">
            <div class="label-row">
                <label for="examScore">시험 횟수</label>
                <span class="current-value">{scores.exam}</span>
            </div>
            <input
                type="range"
                id="examScore"
                name="examScore"
                min="0"
                max="10"
                step="1"
                bind:value={scores.exam}
            />
            <div class="range-guide">
                <span>적음(0)</span>
                <span>많음(10)</span>
            </div>
        </div>
	</div>
{/snippet}

{#snippet TitleInput()}
	<label for="title">한줄평</label>
	<input type="text" id="title" name="title" required value={review?.title} maxlength="100" />
{/snippet}

{#snippet CommentInput()}
	<label for="comment">내용</label>
	<textarea id="comment" name="comment">{review?.comment}</textarea>
{/snippet}

<section class="module">
	<CommonForm
		actionName={review ? 'editReview' : 'createReview'}
		formName={review ? 'editReview' : 'createReview'}
	>
		<div id="form-div" class="container-col">
			<div class="input-row">
                {@render CourseInputs()}
				{@render TermInputs()}   
            </div>
			{@render TitleInput()}
			{@render CommentInput()}
			{@render ScoreInputs()}
			<div class="right-align">
				<button type="submit" class="btn-action">{review ? '수정하기' : '평가하기'}</button>
			</div>
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

		.select_group {
			display: flex;
			flex-direction: column;
		}

		label {
			word-break: keep-all;
			white-space: nowrap;
			font-size: 0.9rem;
			font-weight: bold;
			margin-left: 0.2rem;
			margin-bottom: 0.2rem;
		}
		
		input {
			width: stretch;
		}

		input[type='number'],
		select {
			width: stretch;
			margin-right: 1.5rem;
		}

		textarea {
			width: stretch;
			height: 10vh;
			resize: vertical;
		}

		.input-row {
		width: 100%;
		display: flex;
		justify-content: space-between; 
		gap: 2rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
		}
	}

    #score-container {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        margin-bottom: 1rem;
    }

    .score-item {
        flex: 1;
        min-width: 200px;
        display: flex;
        flex-direction: column;
		
		margin-right: 2rem;

        .label-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;

            .current-value {
                color: var(--secondary);
                font-weight: bold;
                font-size: 1.1rem;
            }
        }

        input[type='range'] {
            cursor: pointer;
            accent-color: var(--secondary);
            margin-bottom: 0.3rem;
			margin-right: 0.5rem;
			margin-left: 0.5rem;
        }

        .range-guide {
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            color: var(--secondary-text);
        }
	}
</style>
