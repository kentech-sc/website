<script lang="ts">
	import BookPlus from '@lucide/svelte/icons/book-plus';
	import Calendar from '@lucide/svelte/icons/calendar-days';
	import CheckCircle from '@lucide/svelte/icons/circle-check-big';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import Upload from '@lucide/svelte/icons/upload-cloud';

	import AcademicHeader from '$components/AcademicHeader.svelte';

	let { form } = $props();
	let year = $state(new Date().getFullYear());
	let term = $state(1);
	let fileName = $state('');
	let specialCategory = $state('');
	let specialCreditType = $state('numeric');
	let specialCredits = $state(3);
	const categoryOptions = [
		['VC', '가치창출'],
		['EF', '에너지 기초'],
		['EL', '에너지 전공'],
		['MN', '수학·자연'],
		['HASS', '인문사회'],
		['ESP', '영어'],
		['IR', '개별연구'],
		['CAPS', '캡스톤'],
		['EN', '창업'],
		['RC', 'RC'],
		['FR', '자유선택']
	] as const;

	function detectPeriod(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		fileName = file.name;
		const yearMatch = file.name.match(/20\d{2}/);
		if (yearMatch) year = Number(yearMatch[0]);
		if (/(하계|여름)/.test(file.name)) term = 3;
		else if (/(동계|겨울)/.test(file.name)) term = 4;
		else {
			const termMatch = file.name.match(/20\d{2}[_\s-]*(\d)\s*학기/i);
			if (termMatch) term = Number(termMatch[1]);
		}
	}

	function updateSpecialCreditType() {
		if (specialCreditType === 'pass') specialCredits = 0;
		else if (specialCredits === 0) specialCredits = 3;
	}
</script>

<section class="import-page">
	<AcademicHeader
		title="강의 데이터 가져오기"
		description="학사시스템에서 받은 개설교과목 엑셀을 업로드해 해당 학기의 강의를 갱신합니다."
		canManageCatalog
	/>

	<form
		method="POST"
		action="?/importOfferings"
		enctype="multipart/form-data"
		class="module import-card"
	>
		<label class="file-drop">
			<span class="file-icon"><FileSpreadsheet size="1.45rem" /></span>
			<span class="file-copy">
				<b>{fileName || '개설교과목 엑셀 선택'}</b>
				<small
					>{fileName
						? '다른 파일을 선택하려면 다시 누르세요.'
						: '학교에서 내려받은 .xlsx 파일을 그대로 사용할 수 있습니다.'}</small
				>
			</span>
			<span class="choose-button"><Upload size="0.9rem" />파일 선택</span>
			<input
				type="file"
				name="workbook"
				accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				required
				onchange={detectPeriod}
			/>
		</label>

		<section class="period-section">
			<div class="section-title">
				<Calendar size="1rem" />
				<div>
					<h2>적용 학기</h2>
					<p>파일명에서 자동으로 찾았지만, 적용 전에 꼭 확인하세요.</p>
				</div>
			</div>
			<div class="period-fields">
				<label
					><span>개설 연도</span><input
						type="number"
						name="year"
						min="2022"
						max="2100"
						bind:value={year}
						required
					/></label
				>
				<label
					><span>학기</span><select name="term" bind:value={term} required
						><option value={1}>1학기</option><option value={2}>2학기</option><option value={3}
							>하계학기</option
						><option value={4}>동계학기</option></select
					></label
				>
			</div>
		</section>

		<details class="import-rules">
			<summary>가져올 때 적용되는 기준</summary>
			<ul>
				<li>파일명의 연도와 학기를 자동 입력하며, 관리자가 직접 수정할 수 있습니다.</li>
				<li>대표교수가 여러 명이면 모두 해당 개설 강의의 교수로 저장합니다.</li>
				<li>
					P 과목은 개별 학점을 0으로 보존하며, ESP는 단계 이수 규칙으로 졸업학점에 반영합니다.
				</li>
				<li>폐강 표시 또는 폐강일자가 있는 강의는 가져오지 않습니다.</li>
			</ul>
		</details>

		<button class="submit-button" disabled={!fileName}
			><Upload size="0.95rem" />이 학기의 강의 데이터 반영</button
		>
	</form>

	<section class="module special-card">
		<div class="special-header">
			<span><BookPlus size="1.15rem" /></span>
			<div>
				<h2>특수 강의 등록</h2>
				<p>개설 강좌가 없는 학점 인정용 강의를 공통 목록에 등록합니다.</p>
			</div>
		</div>
		<form method="POST" action="?/createSpecialCourse" class="special-form">
			<label>
				<span>강의 코드</span>
				<input name="courseId" maxlength="20" placeholder="예: SP1001" required />
			</label>
			<label class="course-name-field">
				<span>강의명</span>
				<input name="courseName" maxlength="200" placeholder="공식 강의명" required />
			</label>
			<label>
				<span>학점 방식</span>
				<select name="creditType" bind:value={specialCreditType} onchange={updateSpecialCreditType}>
					<option value="numeric">학점</option>
					<option value="pass">P</option>
				</select>
			</label>
			<label>
				<span>학점</span>
				<input
					type="number"
					name="credits"
					min="0"
					max="99"
					step="0.5"
					bind:value={specialCredits}
					disabled={specialCreditType === 'pass'}
					required
				/>
			</label>
			<label>
				<span>졸업요건 영역</span>
				<select name="category" bind:value={specialCategory} required>
					<option value="">영역 선택</option>
					{#each categoryOptions as [value, label] (value)}
						<option {value}>{label} ({value})</option>
					{/each}
				</select>
			</label>
			<label>
				<span>EF 세부 분야 <small>(선택)</small></span>
				<select name="subcategory" disabled={specialCategory !== 'EF'}>
					<option value="">해당 없음</option>
					<option value="math">수학</option>
					<option value="physics">물리</option>
					<option value="chemistry">화학</option>
					<option value="data_literacy">데이터 리터러시</option>
					<option value="ap">AP 인정</option>
				</select>
			</label>
			<label>
				<span>레벨 <small>(선택)</small></span>
				<input
					type="number"
					name="level"
					min="1"
					max="9"
					placeholder="예: 4"
					disabled={specialCategory !== 'EL'}
				/>
			</label>
			<label class="exclude-field">
				<input type="checkbox" name="gradExcluded" />
				<span>졸업학점 계산에서 제외</span>
			</label>
			<div class="special-submit">
				<p>이수 학기와 성적은 학생이 수강 이력에 추가할 때 입력합니다.</p>
				<button><BookPlus size="0.95rem" />공통 강의 등록</button>
			</div>
		</form>
	</section>

	{#if form?.importedCount}
		<div class="result-card" aria-live="polite">
			<CheckCircle size="1.25rem" />
			<div>
				<strong>{form.importedCount}개 개설 강의를 반영했습니다.</strong>
				<div>
					{#if form.skippedClosedCount}<span>폐강 제외 {form.skippedClosedCount}</span
						>{/if}{#if form.passCreditCount}<span>P 과목 {form.passCreditCount}</span
						>{/if}{#if form.multipleProfessorCount}<span
							>복수 교수 {form.multipleProfessorCount}</span
						>{/if}
				</div>
			</div>
		</div>
	{/if}
	{#if form?.createdCourse}
		<div class="result-card" aria-live="polite">
			<CheckCircle size="1.25rem" />
			<div>
				<strong
					>[{form.createdCourse.id}] {form.createdCourse.name} · {form.createdCourse.creditType ===
					'pass'
						? 'P'
						: `${form.createdCourse.credits}학점`}으로 등록했습니다.</strong
				>
				<small>이제 수강 이력의 ‘한 과목 직접 추가’에서 검색할 수 있습니다.</small>
			</div>
		</div>
	{/if}
	{#if form?.message}<p class="error-message" aria-live="polite">{form.message}</p>{/if}
</section>

<style lang="scss">
	.import-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}
	.import-card,
	.special-card,
	.result-card {
		border-radius: 0.8rem;
		background: var(--white);
	}
	.import-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
	}
	.special-card {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		padding: 1rem;
	}
	.special-header {
		display: flex;
		align-items: center;
		gap: 0.55rem;
	}
	.special-header > span {
		display: grid;
		place-items: center;
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--secondary) 10%, white);
		width: 2.2rem;
		height: 2.2rem;
		color: var(--secondary);
	}
	.special-header h2,
	.special-header p,
	.special-submit p {
		margin: 0;
	}
	.special-header h2 {
		font-size: 0.9rem;
	}
	.special-header p,
	.special-submit p {
		color: var(--gray-text);
		font-size: 0.68rem;
	}
	.special-form {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.65rem;
	}
	.special-form label:not(.exclude-field) {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.special-form label > span {
		font-weight: 600;
		font-size: 0.7rem;
	}
	.special-form label small {
		color: var(--gray-text);
		font-weight: 400;
	}
	.course-name-field {
		grid-column: span 2;
	}
	.exclude-field {
		display: flex;
		align-items: center;
		align-self: end;
		gap: 0.4rem;
		min-height: var(--input-height);
	}
	.exclude-field input {
		width: auto;
	}
	.special-submit {
		display: flex;
		grid-column: 1 / -1;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding-top: 0.75rem;
	}
	.special-submit button {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		border-color: var(--secondary);
		background: var(--secondary);
		color: white;
	}
	.file-drop {
		display: grid;
		position: relative;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		border: 1px dashed color-mix(in srgb, var(--secondary) 55%, var(--gray-border));
		border-radius: 0.7rem;
		background: color-mix(in srgb, var(--secondary) 3%, white);
		padding: 1.2rem;
	}
	.file-drop:hover {
		background: color-mix(in srgb, var(--secondary) 6%, white);
	}
	.file-drop input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
	}
	.file-icon {
		display: grid;
		place-items: center;
		border-radius: 0.6rem;
		background: color-mix(in srgb, var(--secondary) 10%, white);
		width: 2.8rem;
		height: 2.8rem;
		color: var(--secondary);
	}
	.file-copy {
		display: flex;
		flex-direction: column;
	}
	.file-copy b {
		font-size: 0.9rem;
	}
	.file-copy small {
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.choose-button,
	.submit-button,
	.section-title,
	.result-card {
		display: flex;
		align-items: center;
	}
	.choose-button {
		gap: 0.25rem;
		border: 1px solid var(--gray-border);
		border-radius: 0.4rem;
		background: white;
		padding: 0.35rem 0.55rem;
		font-weight: 600;
		font-size: 0.7rem;
	}
	.period-section {
		border-top: 1px solid var(--gray-border);
		padding-top: 1rem;
	}
	.section-title {
		gap: 0.5rem;
	}
	.section-title :global(svg) {
		color: var(--secondary);
	}
	.section-title h2 {
		margin: 0;
		font-size: 0.9rem;
	}
	.section-title p {
		margin: 0;
		color: var(--gray-text);
		font-size: 0.68rem;
	}
	.period-fields {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
		margin-top: 0.65rem;
	}
	.period-fields label {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.period-fields label span {
		font-weight: 600;
		font-size: 0.7rem;
	}
	.import-rules {
		border-radius: 0.55rem;
		background: var(--gray-bg);
		padding: 0.65rem 0.75rem;
	}
	.import-rules summary {
		cursor: pointer;
		font-weight: 600;
		font-size: 0.72rem;
	}
	.import-rules ul {
		margin: 0.55rem 0 0;
		padding-left: 1rem;
		color: var(--gray-text);
		font-size: 0.68rem;
		line-height: 1.65;
	}
	.submit-button {
		align-self: flex-end;
		gap: 0.3rem;
		border-color: var(--secondary);
		background: var(--secondary);
		padding: 0.45rem 0.75rem;
		color: white;
	}
	.result-card {
		gap: 0.65rem;
		border-color: var(--success);
		padding: 0.85rem;
		color: var(--success-text);
	}
	.result-card > div {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.result-card strong {
		font-size: 0.8rem;
	}
	.result-card div div {
		display: flex;
		gap: 0.3rem;
	}
	.result-card span {
		border-radius: 999px;
		background: var(--success-bg);
		padding: 0.18rem 0.4rem;
		font-size: 0.62rem;
	}
	.error-message {
		margin: 0;
		border-radius: 0.5rem;
		background: var(--error-bg);
		padding: 0.7rem;
		color: var(--error-text);
		font-size: 0.76rem;
	}
	@media (max-width: 600px) {
		.file-drop {
			grid-template-columns: auto 1fr;
		}
		.choose-button {
			grid-column: 1 / -1;
			justify-content: center;
		}
		.period-fields {
			grid-template-columns: 1fr;
		}
		.special-form {
			grid-template-columns: 1fr;
		}
		.course-name-field {
			grid-column: auto;
		}
		.special-submit {
			flex-direction: column;
			align-items: stretch;
		}
		.special-submit button {
			justify-content: center;
		}
		.submit-button {
			justify-content: center;
			align-self: stretch;
		}
	}
</style>
