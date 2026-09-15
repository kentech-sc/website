<script lang="ts">
	import type { Course } from '$lib/types/course.type.js';

	import {
		isSameCourseName,
		parsePortalCompletionText
	} from '$lib/shared/portal-completion-import.js';

	let { courses }: { courses: Course[] } = $props();

	let portalData = $state('');
	let hideGrade = $state(false);

	const parsed = $derived(parsePortalCompletionText(portalData));
	const courseNameById = $derived(new Map(courses.map((course) => [course.id, course.name])));
	const nameMismatchRows = $derived(
		parsed.rows.filter((row) => {
			const catalogName = courseNameById.get(row.courseId);
			return catalogName !== undefined && !isSameCourseName(catalogName, row.courseName);
		})
	);
	const matchedRows = $derived(
		parsed.rows.filter((row) => {
			const catalogName = courseNameById.get(row.courseId);
			return catalogName !== undefined && isSameCourseName(catalogName, row.courseName);
		})
	);
	const newCourseRows = $derived(parsed.rows.filter((row) => !courseNameById.has(row.courseId)));
	const importableCount = $derived(matchedRows.length + newCourseRows.length);

	const termLabel = (term: number) => ['1학기', '2학기', '하계', '동계'][term - 1];
</script>

<section class="portal-import-form">
	<header class="import-step-heading">
		<span>4</span>
		<div>
			<b>결과 붙여넣기</b>
			<p>복사한 결과를 아래 칸에 붙여 넣고, 과목을 확인한 뒤 등록합니다.</p>
		</div>
	</header>

	<form method="POST" action="?/importCompletions">
		<label for="portal-data">추출 결과</label>
		<textarea
			id="portal-data"
			name="portalData"
			rows="6"
			bind:value={portalData}
			placeholder="Console에서 복사된 결과를 여기에 붙여 넣으세요."></textarea>

		{#if portalData.trim()}
			{#if matchedRows.length}
				<section class="confirmed-courses" aria-live="polite">
					<header><b>확인된 과목</b><span>{matchedRows.length}개</span></header>
					<ul>
						{#each matchedRows as row (`${row.courseId}-${row.year}-${row.term}`)}
							<li>
								<span><b>{row.courseId}</b> {row.courseName}</span>
								<span>{row.year} {termLabel(row.term)} · {row.grade}</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if newCourseRows.length || nameMismatchRows.length || parsed.skippedCount}
				<div class="import-summary">
					{#if newCourseRows.length}<span>{newCourseRows.length}개 신규 강의</span>{/if}
					{#if nameMismatchRows.length}<span>{nameMismatchRows.length}개 강의명 불일치</span>{/if}
					{#if parsed.skippedCount}<span>{parsed.skippedCount}개 제외</span>{/if}
				</div>
			{/if}

			{#if newCourseRows.length}
				<p class="import-note">
					목록에 없어 새로 등록되는 강의: {[
						...new Set(newCourseRows.map((row) => row.courseId))
					].join(', ')}
				</p>
			{/if}

			{#if nameMismatchRows.length}
				<p class="import-warning">
					같은 코드가 다른 강의명으로 등록되어 있어 제외됩니다: {[
						...new Set(
							nameMismatchRows.map(
								(row) => `${row.courseId} (${courseNameById.get(row.courseId)} ≠ ${row.courseName})`
							)
						)
					].join(', ')}
				</p>
			{/if}
		{/if}

		<footer class="import-submit-row">
			<label class="hide-grade-option">
				<input type="checkbox" name="hideGrade" bind:checked={hideGrade} />
				성적(학점)은 저장하지 않고 이수 여부만 등록
			</label>
			<button class="ui-button is-primary is-compact" disabled={!importableCount}>
				확인한 {importableCount}개 과목 등록
			</button>
		</footer>
	</form>
</section>

<style lang="scss">
	.portal-import-form {
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding-top: 0.8rem;
	}
	.import-step-heading {
		display: grid;
		grid-template-columns: 1.6rem minmax(0, 1fr);
		gap: 0.6rem;
	}
	.import-step-heading > span {
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: var(--secondary);
		width: 1.6rem;
		height: 1.6rem;
		color: var(--white);
		font-weight: 700;
		font-size: 0.7rem;
	}
	.import-step-heading b,
	.import-step-heading p {
		margin: 0;
	}
	.import-step-heading b {
		font-size: 0.8rem;
	}
	.import-step-heading p {
		margin-top: 0.2rem;
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-top: 0.6rem;
	}
	form > label {
		font-weight: 600;
		font-size: 0.8rem;
	}
	textarea {
		background: var(--white);
		width: 100%;
		resize: vertical;
		line-height: 1.5;
		font-family: monospace;
	}
	.confirmed-courses {
		border: var(--divider-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		background: var(--white);
		overflow: hidden;
	}
	.confirmed-courses > header,
	.confirmed-courses li,
	.import-summary,
	.import-submit-row,
	.hide-grade-option {
		display: flex;
		align-items: center;
	}
	.confirmed-courses > header {
		justify-content: space-between;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		padding: 0.4rem 0.6rem;
		font-size: 0.7rem;
	}
	.confirmed-courses > header span {
		color: var(--success-text);
		font-weight: 600;
	}
	.confirmed-courses ul {
		margin: 0;
		padding: 0 0.6rem;
		max-height: 13rem;
		overflow: auto;
		list-style: none;
	}
	.confirmed-courses li {
		justify-content: space-between;
		gap: 0.8rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		padding: 0.4rem 0;
		font-size: 0.8rem;
	}
	.confirmed-courses li:last-child {
		border-bottom: 0;
	}
	.confirmed-courses li span:last-child {
		flex-shrink: 0;
		color: var(--gray-text);
	}
	.import-summary {
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.import-summary span {
		border-radius: 999px;
		background: var(--gray-bg);
		padding: 0.2rem 0.6rem;
		color: var(--gray-text);
		font-size: 0.8rem;
	}
	.import-note,
	.import-warning {
		margin: 0;
		font-size: 0.8rem;
	}
	.import-note {
		color: var(--info-text);
	}
	.import-warning {
		color: var(--error-text);
	}
	.import-submit-row {
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.6rem;
	}
	.hide-grade-option {
		gap: 0.4rem;
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	@media (max-width: 680px) {
		.confirmed-courses li {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.2rem;
		}
	}
</style>
