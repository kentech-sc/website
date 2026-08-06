<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';

	import type { Offering } from '$lib/types/academic.type.js';
	import type { Review } from '$lib/types/review.type.js';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';
	import StarRating from '$components/StarRating.svelte';
	import { translatedTerm } from '$lib/shared/view.js';

	let {
		reviewableOfferings = [],
		review
	}: {
		reviewableOfferings?: Offering[];
		review?: Review;
	} = $props();

	let initializedFor = $state<string | null>(null);
	let loading = $state(false);
	let offeringQuery = $state('');
	let yearFilter = $state('');
	let termFilter = $state('');
	const availableYears = $derived(
		[...new Set(reviewableOfferings.map((offering) => offering.year))].sort((a, b) => b - a)
	);
	const availableTerms = $derived(
		[...new Set(reviewableOfferings.map((offering) => offering.term))].sort((a, b) => a - b)
	);
	const filteredOfferings = $derived(
		reviewableOfferings
			.filter((offering) => !yearFilter || offering.year === Number(yearFilter))
			.filter((offering) => !termFilter || offering.term === Number(termFilter))
			.filter((offering) =>
				`${offering.courseId} ${offering.courseName} ${offering.subtitle ?? ''} ${offering.professors.map((professor) => professor.name).join(' ')} ${offering.section}`
					.toLowerCase()
					.includes(offeringQuery.trim().toLowerCase())
			)
	);
	let scores = $state({ assignment: 3, lecture: 3, exam: 3, satisfaction: 10 });

	$effect(() => {
		const formKey = review?.id ?? 'new';
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
		if (value <= 1) return '매우 적음';
		if (value <= 2) return '적음';
		if (value <= 3) return '보통';
		if (value <= 4) return '많음';
		return '매우 많음';
	}

	function getDifficultyLabel(value: number): string {
		if (value <= 1) return '매우 쉬움';
		if (value <= 2) return '쉬움';
		if (value <= 3) return '보통';
		if (value <= 4) return '어려움';
		return '매우 어려움';
	}

	function termLabel(term: number): string {
		return ['1학기', '2학기', '하계', '동계'][term - 1] ?? `${term}학기`;
	}

	function offeringLabel(offering: Offering): string {
		const section = offering.section ? ` · ${offering.section}분반` : '';
		const professors = offering.professors.map((professor) => professor.name).join(', ');
		return `[${offering.courseId}] ${offering.courseName} · ${offering.year}-${offering.term}${section} · ${professors || '담당 교수 개별 배정'}`;
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
				{#if review}
					<p class="fixed-offering">
						<strong>[{review.courseId}] {review.courseName}</strong>
						<span>
							{review.year}년 {translatedTerm[review.term]}학기
							{review.section ? ` · ${review.section}분반` : ''}
							· {review.professors.map((professor) => professor.name).join(', ') ||
								'담당 교수 개별 배정'}
						</span>
					</p>
				{:else}
					<div class="offering-filter-row">
						<CommonLabel labelFor="yearFilter" labelString="연도">
							<select id="yearFilter" bind:value={yearFilter}>
								<option value="">전체</option>
								{#each availableYears as year (year)}
									<option value={year}>{year}년</option>
								{/each}
							</select>
						</CommonLabel>
						<CommonLabel labelFor="termFilter" labelString="학기">
							<select id="termFilter" bind:value={termFilter}>
								<option value="">전체</option>
								{#each availableTerms as term (term)}
									<option value={term}>{termLabel(term)}</option>
								{/each}
							</select>
						</CommonLabel>
						<CommonLabel labelFor="offeringQuery" labelString="개설 강의 검색">
							<input
								id="offeringQuery"
								type="search"
								placeholder="강의 코드 또는 교수명"
								bind:value={offeringQuery}
							/>
						</CommonLabel>
					</div>
					<div class="offering-picker">
						<CommonLabel labelFor="offeringId" labelString="평가할 개설 강의">
							<select id="offeringId" name="offeringId" required>
								<option value="">선택</option>
								{#each filteredOfferings as offering (offering.id)}
									<option value={offering.id}>{offeringLabel(offering)}</option>
								{/each}
							</select>
						</CommonLabel>
					</div>
				{/if}

				<CommonLabel labelFor="title" labelString="제목">
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
						<div class="review-range-guide"><span>적음</span><span>많음</span></div>
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
						<div class="review-range-guide"><span>쉬움</span><span>어려움</span></div>
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
						<div class="review-range-guide"><span>적음</span><span>많음</span></div>
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
				<button type="submit" class="action-btn"
					><Pencil size="0.8rem" />{review ? '수정하기' : '평가하기'}</button
				>
			</div>
		</div>
	</CommonForm>
</section>

<style lang="scss">
	@use 'media';

	section {
		gap: 0.8rem;
	}
	select {
		width: 100%;
	}
	textarea {
		resize: vertical;
	}
	.review-form {
		gap: 1.2rem;
		& > * {
			width: stretch;
		}
	}
	.input-section {
		gap: 0.6rem;
	}
	.offering-filter-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr);
		gap: 1rem;
		width: 100%;
		@include media.mobile {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		}
	}
	.offering-picker {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
		width: 100%;
	}
	.fixed-offering {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		margin: 0;
		border-radius: 0.4rem;
		background: var(--gray-bg);
		padding: 0.7rem;
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
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.6rem;
		@include media.mobile {
			grid-template-columns: minmax(0, 1fr);
		}
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
