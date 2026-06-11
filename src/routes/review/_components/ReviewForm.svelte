<script lang="ts">
	import type { Course } from '$lib/types/course.type.js';
	import type { Professor } from '$lib/types/professor.type.js';
	import type { Review } from '$lib/types/review.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import StarRating from '$components/StarRating.svelte';
	import { translatedTerm } from '$lib/shared/view.js';

	let {
		professors,
		courses,
		review
	}: { professors: Professor[]; courses: Course[]; review?: Review } = $props();

	let initializedFor = $state<string | null>(null);
	let scores = $state({
		assignment: 5,
		lecture: 5,
		exam: 5,
		satisfaction: 10
	});

	$effect(() => {
		const formKey = review?._id ?? 'new';

		if (initializedFor === formKey) return;

		initializedFor = formKey;
		scores = {
			assignment: review?.score.assignment ?? 5,
			lecture: review?.score.lecture ?? 5,
			exam: review?.score.exam ?? 5,
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

<section class="module">
	<CommonForm
		actionName={review ? 'editReview' : 'createReview'}
		formName={review ? 'editReview' : 'createReview'}
	>
		<div class="review-form">
			<div class="review-input-row">
				<div class="review-input-pair">
					<div class="field-group field-group-strong">
						<label for="courseId">강의 코드</label>
						<select id="courseId" name="courseId" required value={review?.courseId.toString()}>
							<option value="">선택</option>
							{#each courses as course (course._id)}
								<option value={course._id}>[{course._id}] {course.name}</option>
							{/each}
						</select>
					</div>

					<div class="field-group field-group-strong">
						<label for="professorId">담당 교수</label>
						<select
							id="professorId"
							name="professorId"
							required
							value={review?.professorId.toString()}
						>
							<option value="">선택</option>
							{#each professors as professor (professor._id)}
								<option value={professor._id}>{professor.name} 교수님</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="review-input-pair">
					<div class="field-group field-group-strong">
						<label for="year">수강 연도</label>
						<select id="year" name="year" required value={review?.year}>
							<option value="">선택</option>
							{#each Array.from({ length: new Date().getFullYear() - 2021 }, (_, i) => 22 + i) as year (year)}
								<option value={year}>{year}년</option>
							{/each}
						</select>
					</div>

					<div class="field-group field-group-strong">
						<label for="term">수강 학기</label>
						<select id="term" name="term" required value={review?.term.toString()}>
							<option value="">선택</option>
							<option value="1">{translatedTerm[1]}학기</option>
							<option value="2">{translatedTerm[2]}학기</option>
							<option value="3">{translatedTerm[3]}학기</option>
							<option value="4">{translatedTerm[4]}학기</option>
						</select>
					</div>
				</div>
			</div>

			<div class="field-group field-group-strong">
				<label for="title">제목</label>
				<input type="text" id="title" name="title" required value={review?.title} maxlength="100" />
			</div>

			<div class="field-group field-group-strong">
				<label for="comment">내용</label>
				<textarea id="comment" name="comment" class="review-comment">{review?.comment}</textarea>
			</div>

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
					<StarRating interactive bind:score={scores.satisfaction} />
					<input
						type="hidden"
						name="satisfactionScore"
						id="satisfactionScore"
						value={scores.satisfaction}
					/>
				</div>
			</div>

			<div class="form-actions-end">
				<button type="submit" class="btn-action">{review ? '수정하기' : '평가하기'}</button>
			</div>
		</div>
	</CommonForm>
</section>

<style lang="scss">
	.review-form {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		align-items: stretch;
	}

	.review-input-row {
		display: flex;
		gap: 1.6rem;
		flex-wrap: wrap;
	}

	.review-input-pair {
		flex: 1 1 24rem;
		min-width: 20rem;
		display: flex;
		gap: 1.2rem;
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
		flex-wrap: wrap;
	}

	.review-score-item {
		flex: 1 1 20rem;
		display: flex;
		flex-direction: column;
	}

	.review-label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.6rem;
	}

	.review-label-row label {
		font-weight: bold;
	}

	.review-current-label {
		color: var(--secondary);
		font-weight: bold;
	}

	.review-range {
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
		width: 100%;
		padding: 0.2rem;
		margin: 0 0 0.4rem;
		background: var(--gray-bg);
		border-radius: 0.9rem;
		border: solid 0.1rem var(--gray-border);
	}

	.review-range::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 1.3rem;
		height: 0.8rem;
		background: var(--secondary);
		border-radius: 0.9rem;
	}

	.review-range-guide {
		display: flex;
		justify-content: space-between;
		font-size: 0.7rem;
		color: var(--secondary-text);
	}

	.review-satisfaction {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
	}

	.review-satisfaction label {
		font-size: 1.2rem;
		font-weight: bold;
	}

	@media (max-width: 768px) {
		.review-input-row,
		.review-input-pair,
		.review-slider-row {
			flex-direction: column;
			gap: 0.8rem;
		}

		.review-input-pair,
		.review-score-item {
			min-width: 0;
		}
	}
</style>
