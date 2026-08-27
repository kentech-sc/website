<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';

	import RecordEntryDialog from './RecordEntryDialog.svelte';

	import type { Course } from '$lib/types/course.type.js';
	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';
	import { DEGREE_CATEGORIES } from '$lib/types/degree.type.js';

	let { courses }: { courses: Course[] } = $props();

	let open = $state(false);
	let error = $state('');
	let mode = $state<'catalog' | 'new'>('catalog');
	let courseQuery = $state('');
	let selectedCourseId = $state('');
	let selectedCredits = $state(3);
	let newCourseCode = $state('');
	let newCourseName = $state('');
	let newCourseCredits = $state(3);
	let newCourseCategory = $state<string>('FR');

	const filteredCourses = $derived(
		courses.filter((course) =>
			`${course.id} ${course.name}`.toLowerCase().includes(courseQuery.trim().toLowerCase())
		)
	);
	const selectedCourse = $derived(courses.find((course) => course.id === selectedCourseId) ?? null);
	const duplicateNewCourse = $derived(
		mode === 'new' && newCourseCode.trim()
			? (courses.find((course) => course.id === newCourseCode.trim().toUpperCase()) ?? null)
			: null
	);

	const selectCatalogCourse = (event: Event) => {
		selectedCourseId = (event.currentTarget as HTMLSelectElement).value;
		const course = courses.find((item) => item.id === selectedCourseId);
		if (course) selectedCredits = course.credits;
	};

	const enhanceAddCompletion: SubmitFunction = () => {
		error = '';
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				error = String(result.data?.message ?? '이수 내역을 추가하지 못했습니다.');
				await update({ reset: false });
				return;
			}
			open = false;
			await update();
		};
	};
</script>

<RecordEntryDialog
	title="교과목 직접 등록"
	description="KIS 일괄 등록이 어려울 때 사용합니다"
	bind:open
>
	{#snippet icon()}<Plus size="1rem" />{/snippet}
	<form
		method="POST"
		action="?/addCompletion"
		use:enhance={enhanceAddCompletion}
		class="completion-form"
	>
		<div class="course-source-switch" role="group" aria-label="강의 선택 방식" hidden>
			<button
				class="ui-button is-secondary is-compact"
				type="button"
				class:is-active={mode === 'catalog'}
				onclick={() => (mode = 'catalog')}>목록에서 선택</button
			>
			<button
				class="ui-button is-secondary is-compact"
				type="button"
				class:is-active={mode === 'new'}
				onclick={() => (mode = 'new')}>목록에 없음</button
			>
		</div>

		{#if mode === 'catalog'}
			<label class="course-field">
				<span>강의</span>
				<input
					type="search"
					bind:value={courseQuery}
					placeholder="목록 안에서 검색"
					aria-label="추가할 강의 검색"
				/>
				<select name="courseId" required value={selectedCourseId} onchange={selectCatalogCourse}>
					<option value="">과목 선택</option>
					{#each filteredCourses as course (course.id)}
						<option value={course.id}>[{course.id}] {course.name}</option>
					{/each}
				</select>
			</label>
		{:else}
			<label>
				<span>과목코드</span>
				<input name="courseId" bind:value={newCourseCode} placeholder="예: M3502.002200" required />
			</label>
			<label class="course-field">
				<span>과목명</span>
				<input name="courseName" bind:value={newCourseName} placeholder="과목명" required />
			</label>
			<label>
				<span>영역</span>
				<select name="category" bind:value={newCourseCategory}>
					{#each DEGREE_CATEGORIES as category (category)}
						<option value={category}>{category}</option>
					{/each}
				</select>
			</label>
			<label>
				<span>학점</span>
				<input
					type="number"
					name="credits"
					min="0"
					step="0.5"
					bind:value={newCourseCredits}
					required
				/>
			</label>
			{#if duplicateNewCourse}
				<p class="form-warning" aria-live="polite">
					이미 존재하는 과목 코드입니다. ({duplicateNewCourse.id} · {duplicateNewCourse.name})
					목록에서 선택해주세요.
				</p>
			{/if}
		{/if}

		<label>
			<span>연도</span>
			<input type="number" name="year" min="2022" value={new Date().getFullYear()} />
		</label>
		<label>
			<span>학기</span>
			<select name="term">
				<option value="1">1학기</option>
				<option value="2">2학기</option>
				<option value="3">하계</option>
				<option value="4">동계</option>
			</select>
		</label>

		{#if mode === 'catalog'}
			<div class="credit-readout" aria-live="polite">
				<span>학점</span>
				<strong class:is-empty={!selectedCourse}>
					{selectedCourse
						? selectedCourse.creditType === 'pass'
							? 'P'
							: `${selectedCredits}학점`
						: '강의를 선택하세요'}
				</strong>
				<input type="hidden" name="credits" value={selectedCredits} />
			</div>
		{/if}

		<label>
			<span>결과</span>
			<select name="status">
				<option value="passed">이수</option>
				<option value="failed">낙제</option>
				<option value="withdrawn">수강 철회</option>
			</select>
		</label>
		<label>
			<span>성적 <small>(선택)</small></span>
			<input name="grade" placeholder="A+, P 등" />
		</label>

		{#if error}<p class="form-warning" aria-live="polite">{error}</p>{/if}
		<button class="ui-button is-primary is-compact" disabled={!!duplicateNewCourse}>
			이수 내역에 추가
		</button>
	</form>
</RecordEntryDialog>

<style lang="scss">
	.completion-form {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.6rem;
	}
	.completion-form label,
	.credit-readout {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.completion-form label > span,
	.credit-readout > span {
		font-weight: 600;
		font-size: 0.7rem;
	}
	.course-field,
	.form-warning,
	.course-source-switch,
	.completion-form > button {
		grid-column: 1 / -1;
	}
	.course-field input {
		margin-bottom: 0.2rem;
	}
	.credit-readout {
		justify-content: flex-end;
		min-width: 0;
	}
	.credit-readout strong {
		padding: 0.2rem 0;
		font-size: 0.8rem;
		line-height: 1.5;
	}
	.credit-readout strong.is-empty {
		color: var(--gray-text);
		font-weight: 400;
	}
	.course-source-switch:not([hidden]) {
		display: flex;
		gap: 0.4rem;
	}
	.course-source-switch button {
		flex: 1;
	}
	.course-source-switch button.is-active {
		border-color: var(--secondary);
		color: var(--secondary);
		font-weight: 700;
	}
	.form-warning {
		margin: 0;
		color: var(--error-text);
		font-size: 0.8rem;
	}
	.completion-form > button {
		justify-self: stretch;
	}
	@media (max-width: 600px) {
		.completion-form {
			grid-template-columns: 1fr;
		}
	}
</style>
