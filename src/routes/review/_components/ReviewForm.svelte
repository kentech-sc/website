<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';

	import type { Course } from '$lib/types/course.type.js';
	import type { Professor } from '$lib/types/professor.type.js';
	import type { Review } from '$lib/types/review.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';
	import StarRating from '$components/StarRating.svelte';
	import { translatedTerm } from '$lib/shared/view.js';

	let {
		professors,
		courses,
		review
	}: { professors: Professor[]; courses: Course[]; review?: Review } = $props();

	let initializedFor = $state<string | null>(null);
	let loading = $state(false);
	let scores = $state({
		assignment: 3,
		lecture: 3,
		exam: 3,
		satisfaction: 10
	});

	$effect(() => {
		const formKey = review?._id ?? 'new';

		if (initializedFor === formKey) return;

		initializedFor = formKey;
		scores = {
			assignment: review?.score.assignment ?? 3,
			lecture: review?.score.lecture ?? 3,
			exam: review?.score.exam ?? 3,
			satisfaction: review?.score.satisfaction ?? 10
		};
	});

	function getAmountLabel(value: number): string {
		if (value <= 1) return '아주 적음';
		if (value <= 2) return '적음';
		if (value <= 3) return '보통';
		if (value <= 4) return '많음';
		return '아주 많음';
	}

	function getDifficultyLabel(value: number): string {
		if (value <= 1) return '매우 쉬움';
		if (value <= 2) return '쉬움';
		if (value <= 3) return '보통';
		if (value <= 4) return '어려움';
		return '매우 어려움';
	}
</script>

<section class="module container-col">
	<CommonForm
		actionName={review ? 'editReview' : 'createReview'}
		formName={review ? 'editReview' : 'createReview'}
		bind:loading
	>
		<div class="review-form container-col">
			<section class="input-section container-col">
				<div>
					<CommonLabel labelFor="courseId" labelString="강의">
						<select id="courseId" name="courseId" value={review?.courseId.toString()}>
							<option value="">선택</option>
							{#each courses as course (course._id)}
								<option value={course._id}>[{course._id}] {course.name}</option>
							{/each}
						</select>
					</CommonLabel>

					<CommonLabel labelFor="professorId" labelString="담당 교수">
						<select id="professorId" name="professorId" value={review?.professorId.toString()}>
							<option value="">선택</option>
							{#each professors as professor (professor._id)}
								<option value={professor._id}>{professor.name} 교수님</option>
							{/each}
						</select>
					</CommonLabel>

					<CommonLabel labelFor="year" labelString="수강 연도">
						<select id="year" name="year" value={review?.year}>
							<option value="">선택</option>
							{#each Array.from({ length: new Date().getFullYear() - 2021 }, (_, i) => 22 + i) as year (year)}
								<option value={year}>{year}년</option>
							{/each}
						</select>
					</CommonLabel>

					<CommonLabel labelFor="term" labelString="수강 학기">
						<select id="term" name="term" value={review?.term.toString()}>
							<option value="">선택</option>
							<option value="1">{translatedTerm[1]}학기</option>
							<option value="2">{translatedTerm[2]}학기</option>
							<option value="3">{translatedTerm[3]}학기</option>
							<option value="4">{translatedTerm[4]}학기</option>
						</select>
					</CommonLabel>
				</div>

				<CommonLabel labelFor="title" labelString="한줄평">
					<input type="text" id="title" name="title" value={review?.title} maxlength="100" />
				</CommonLabel>

				<CommonLabel labelFor="comment" labelString="내용">
					<textarea id="comment" name="comment" class="review-comment">{review?.comment}</textarea>
				</CommonLabel>
			</section>

			<div class="review-score-section">
				<div class="review-slider-row">
					<div class="review-score-item">
						<div class="review-label-row">
							<label for="assignmentScore">과제 양</label>
							<span class="review-current-label">{getAmountLabel(scores.assignment)}</span>
						</div>
						<input
							class="review-range"
							type="range"
							id="assignmentScore"
							name="assignmentScore"
							min="1"
							max="5"
							step="1"
							bind:value={scores.assignment}
						/>
						<div class="review-range-guide">
							<span>적음</span>
							<span>많음</span>
						</div>
					</div>

					<div class="review-score-item">
						<div class="review-label-row">
							<label for="lectureScore">강의 난이도</label>
							<span class="review-current-label">{getDifficultyLabel(scores.lecture)}</span>
						</div>
						<input
							class="review-range"
							type="range"
							id="lectureScore"
							name="lectureScore"
							min="1"
							max="5"
							step="1"
							bind:value={scores.lecture}
						/>
						<div class="review-range-guide">
							<span>쉬움</span>
							<span>어려움</span>
						</div>
					</div>

					<div class="review-score-item">
						<div class="review-label-row">
							<label for="examScore">시험 횟수</label>
							<span class="review-current-label">{getAmountLabel(scores.exam)}</span>
						</div>
						<input
							class="review-range"
							type="range"
							id="examScore"
							name="examScore"
							min="1"
							max="5"
							step="1"
							bind:value={scores.exam}
						/>
						<div class="review-range-guide">
							<span>적음</span>
							<span>많음</span>
						</div>
					</div>
				</div>

				<div class="review-satisfaction">
					<label for="satisfactionScore">만족도</label>
					<StarRating interactive disabled={loading} bind:score={scores.satisfaction} />
					<input
						type="hidden"
						name="satisfactionScore"
						id="satisfactionScore"
						value={scores.satisfaction}
					/>
				</div>
			</div>

			<div class="form-actions-end">
				<button type="submit" class="action-btn">
					<Pencil size="0.8rem" />{review ? '수정하기' : '평가하기'}
				</button>
			</div>
		</div>
	</CommonForm>
</section>

<style lang="scss">
	section {
		gap: 0.8rem;
	}

	.review-form {
		gap: 1.2rem;

		& > * {
			width: stretch;
		}
	}

	.input-section {
		gap: 0.6rem;

		& > div:first-child {
			display: grid;
			grid-template-columns: 4fr 2fr 1fr 1fr;
			gap: 1rem;
			width: 100%;
		}
	}

	.review-comment {
		min-height: 8rem;
	}

	.review-score-section {
		display: flex;
		flex-direction: column;
		gap: 1.2rem;
	}

	.review-slider-row {
		display: flex;
		gap: 1.6rem;
	}

	.review-score-item {
		display: flex;
		flex: 1 1 20rem;
		flex-direction: column;
	}

	.review-label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.2rem;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.review-current-label {
		color: var(--secondary);
	}

	.review-range {
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
		border: solid 0.1rem var(--gray-border);
		border-radius: 1rem;
		background: var(--gray-bg);
		padding: 0.1rem;
		width: 100%;
	}

	.review-range::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		border-radius: 1rem;
		background: var(--secondary);
		width: 1.4rem;
		height: 0.8rem;
	}

	.review-range-guide {
		display: flex;
		justify-content: space-between;
		margin-top: 0.2rem;
		color: var(--gray);
		font-size: 0.7rem;
	}

	.review-satisfaction {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
	}

	.review-satisfaction label {
		font-weight: bold;
		font-size: 1.2rem;
	}

	.form-actions-end {
		display: flex;
		justify-content: right;
	}
</style>
