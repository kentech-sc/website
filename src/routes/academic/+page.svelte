<script lang="ts">
	import BookOpenCheck from '@lucide/svelte/icons/book-open-check';
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import Settings2 from '@lucide/svelte/icons/settings-2';
	import Trash from '@lucide/svelte/icons/trash-2';
	import { SvelteMap } from 'svelte/reactivity';

	import PortalCompletionImport from './_components/PortalCompletionImport.svelte';
	import RecordEntryDialog from './_components/RecordEntryDialog.svelte';

	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';
	import AcademicHeader from '$components/AcademicHeader.svelte';

	let { data, form } = $props();
	let historyQuery = $state('');
	let courseQuery = $state('');
	let selectedCourseId = $state('');
	let manualCredits = $state(3);
	let manualAddOpen = $state(false);
	let manualAddError = $state('');
	let exchangeAddOpen = $state(false);

	const progress = $derived(data.degreeProgress);
	const espProgress = $derived(
		progress?.sequenceProgress.find((item) => item.category === 'ESP') ?? null
	);
	const completedCourseIds = $derived(
		new Set(
			data.completions
				.filter((completion) => completion.status === 'passed')
				.map((completion) => completion.courseCode)
		)
	);
	const espCourses = $derived(
		data.espCourses.map((course) => ({
			...course,
			waived: data.academicProfile?.espWaivedCourseIds.includes(course.id) ?? false,
			completed: completedCourseIds.has(course.id)
		}))
	);
	const espCourseNames = $derived(
		new Map(data.espCourses.map((course) => [course.id, course.name]))
	);
	const categories = $derived(
		progress ? Object.entries(progress.required).filter(([category]) => category !== 'total') : []
	);
	const totalPercent = $derived(
		progress ? percent(progress.earned.total, progress.required.total) : 0
	);
	const filteredCourses = $derived(
		data.courses.filter((course) =>
			`${course.id} ${course.name}`.toLowerCase().includes(courseQuery.trim().toLowerCase())
		)
	);
	const selectedManualCourse = $derived(
		data.courses.find((course) => course.id === selectedCourseId) ?? null
	);
	const filteredCompletions = $derived(
		data.completions.filter((completion) =>
			`${completion.courseCode} ${completion.courseName} ${completion.institution ?? ''} ${completion.year}`
				.toLowerCase()
				.includes(historyQuery.trim().toLowerCase())
		)
	);
	const completionGroups = $derived(groupCompletions(filteredCompletions));
	const detailRequirements = $derived([
		{
			key: 'ef-math',
			label: 'EF 수학',
			value: progress?.efSub.math ?? 0,
			required: progress?.efSubRequired.math ?? 0,
			unit: '학점'
		},
		{
			key: 'ef-physics',
			label: 'EF 물리',
			value: progress?.efSub.physics ?? 0,
			required: progress?.efSubRequired.physics ?? 0,
			unit: '학점'
		},
		{
			key: 'ef-chemistry',
			label: 'EF 화학',
			value: progress?.efSub.chemistry ?? 0,
			required: progress?.efSubRequired.chemistry ?? 0,
			unit: '학점'
		},
		{
			key: 'ef-data-literacy',
			label: 'EF 데이터 리터러시',
			value: progress?.efSub.dataLiteracy ?? 0,
			required: progress?.efSubRequired.dataLiteracy ?? 0,
			unit: '학점'
		},
		{
			key: 'el-upper',
			label: 'EL 4·5레벨',
			value: progress?.elUpperCredits ?? 0,
			required: progress?.elUpperRequiredCredits ?? 0,
			unit: '학점'
		}
	]);
	const satisfiedDetailCount = $derived(
		detailRequirements.filter((item) => item.value >= item.required).length +
			(espProgress && espProgress.completedStageCount === espProgress.totalStageCount ? 1 : 0)
	);
	const detailRequirementCount = $derived(detailRequirements.length + (espProgress ? 1 : 0));

	function percent(value: number, required: number): number {
		return required <= 0 ? 100 : Math.min(100, Math.round((value / required) * 100));
	}
	function earned(category: string): number {
		return progress ? ((progress.earned as Record<string, number>)[category] ?? 0) : 0;
	}
	function statusLabel(status: string) {
		return status === 'passed' ? '이수' : status === 'failed' ? '낙제' : '수강 철회';
	}
	function termLabel(term: number) {
		return ['1학기', '2학기', '하계', '동계'][term - 1] ?? `${term}학기`;
	}
	function groupCompletions(completions: typeof data.completions) {
		const groups = new SvelteMap<string, typeof data.completions>();
		for (const completion of completions) {
			const key = `${completion.year}-${completion.term}`;
			groups.set(key, [...(groups.get(key) ?? []), completion]);
		}
		return [...groups.entries()];
	}
	function updateManualCourse(event: Event) {
		selectedCourseId = (event.currentTarget as HTMLSelectElement).value;
		const course = data.courses.find((item) => item.id === selectedCourseId);
		if (course) manualCredits = course.credits;
	}
	const manualAddEnhance: SubmitFunction = () => {
		manualAddError = '';
		return async ({ result, update }) => {
			if (result.type === 'failure') {
				manualAddError = String(result.data?.message ?? '수강 이력을 추가하지 못했습니다.');
				await update({ reset: false });
				return;
			}
			manualAddOpen = false;
			await update();
		};
	};
</script>

<section class="academic-page">
	<AcademicHeader
		title="이수·졸업"
		description="지금까지 들은 강의와 졸업까지 남은 요건을 한눈에 확인하세요."
		canManageCatalog={data.canManageCatalog}
	/>

	{#if progress}
		<section class="module overview-card">
			<div class="total-progress">
				<div
					class="progress-ring"
					class:complete={totalPercent >= 100}
					style={`--progress: ${totalPercent * 3.6}deg`}
				>
					<div><strong>{totalPercent}%</strong><span>졸업학점</span></div>
				</div>
				<div class="total-copy">
					{#if data.academicProfile}
						<div class="academic-basis">
							<GraduationCap size="0.8rem" />
							<span>{data.academicProfile.admissionYear}학번</span>
							<i></i>
							<span>ESP {data.academicProfile.espWaivedCourseIds.length}개 스킵</span>
						</div>
					{/if}
					<span>총 이수 학점</span>
					<strong>{progress.earned.total}<small> / {progress.required.total}학점</small></strong>
					<p class:complete={totalPercent >= 100}>
						{totalPercent >= 100
							? '졸업학점을 모두 이수했습니다.'
							: `${Math.max(0, progress.required.total - progress.earned.total)}학점이 남았습니다.`}
					</p>
				</div>
			</div>

			<div class="category-progress">
				{#each categories as [category, required] (category)}
					{@const complete = earned(category) >= required}
					<div class="requirement-row" class:complete>
						<div class="category-code">
							<span>{category}</span>
							{#if complete}<Check size="0.7rem" aria-label="요건 충족" />{/if}
						</div>
						<div class="bar" aria-label={`${category} ${earned(category)} / ${required}학점`}>
							<i style={`width: ${percent(earned(category), required)}%`}></i>
						</div>
						<b>{Math.min(earned(category), required)}<small>/{required}</small></b>
					</div>
				{/each}
			</div>
		</section>

		<details class="module detail-card">
			<summary>
				<BookOpenCheck size="1rem" />
				<span
					><b>세부 이수 요건</b><small
						>EF 세부 분야, EL 상위 레벨, ESP 6개 수업 · {satisfiedDetailCount}/{detailRequirementCount}개
						충족</small
					></span
				>
				<span class="disclosure-icon"><ChevronDown size="0.9rem" /></span>
			</summary>
			<div class="detail-grid">
				{#each detailRequirements as item (item.key)}
					{@const complete = item.value >= item.required}
					<div class="detail-requirement" class:complete>
						<div class="detail-label">
							<span>{item.label}</span><small>{complete ? '충족' : '미충족'}</small>
						</div>
						<b>{item.value}<small>/{item.required} {item.unit}</small></b>
						<div
							class="detail-bar"
							role="progressbar"
							aria-label={`${item.label} 이수 현황`}
							aria-valuemin="0"
							aria-valuemax={item.required}
							aria-valuenow={Math.min(item.value, item.required)}
						>
							<i style={`width: ${percent(item.value, item.required)}%`}></i>
						</div>
					</div>
				{/each}
				{#if espProgress}
					{@const espComplete = espProgress.completedStageCount === espProgress.totalStageCount}
					<div class="detail-requirement esp-detail" class:complete={espComplete}>
						<div class="detail-label">
							<span>ESP 필수 수업</span><small>{espComplete ? '충족' : '미충족'}</small>
						</div>
						<b>{espProgress.completedCount}/{espProgress.totalCount}<small>수업</small></b>
						<div
							class="detail-bar"
							role="progressbar"
							aria-label="ESP 필수 수업 이수 현황"
							aria-valuemin="0"
							aria-valuemax={espProgress.totalCount}
							aria-valuenow={espProgress.completedCount}
						>
							<i style={`width: ${percent(espProgress.completedCount, espProgress.totalCount)}%`}
							></i>
						</div>
						<div class="esp-course-list">
							{#each espCourses as course (course.id)}
								<span
									class:complete={course.completed || course.waived}
									class:waived={course.waived}
								>
									{#if course.completed || course.waived}<Check size="0.65rem" />{/if}
									<b>{course.name}</b>
									{#if course.waived}<small>면제</small>{:else if course.completed}<small
											>이수</small
										>{/if}
								</span>
							{/each}
						</div>
						<p>
							{espProgress.availableCourseIds.length
								? `다음 수업: ${espProgress.availableCourseIds.map((id) => espCourseNames.get(id) ?? id).join(', ')}`
								: '필수 6개 수업 완료'}
						</p>
					</div>
				{/if}
			</div>
		</details>
	{:else}
		<section class="module setup-callout">
			<GraduationCap size="1.5rem" />
			<div>
				<h2>먼저 학사 기준을 설정해 주세요</h2>
				<p>입학연도와 ESP 면제 과목을 저장하면 내 졸업요건을 계산합니다.</p>
			</div>
		</section>
	{/if}

	<section class="module records-card" id="course-history">
		<div class="section-header">
			<div class="section-title">
				<BookOpenCheck size="1.1rem" />
				<div>
					<h2>수강 이력</h2>
					<p>직접 등록한 내용을 기준으로 계산합니다.</p>
				</div>
			</div>
			<label class="search-field"
				><Search size="0.9rem" /><input
					type="search"
					bind:value={historyQuery}
					placeholder="과목명·코드 검색"
					aria-label="수강 이력 검색"
				/></label
			>
		</div>

		<div class="record-tools">
			<PortalCompletionImport courses={data.courses} {form} />
			<RecordEntryDialog
				title="한 과목 직접 추가"
				description="KIS 일괄 등록이 어려울 때 사용합니다"
				bind:open={manualAddOpen}
			>
				{#snippet icon()}<Plus size="1rem" />{/snippet}
				<form
					method="POST"
					action="?/addCompletion"
					use:enhance={manualAddEnhance}
					class="completion-form"
				>
					<label class="course-select"
						><span>강의</span><input
							type="search"
							bind:value={courseQuery}
							placeholder="목록 안에서 검색"
							aria-label="추가할 강의 검색"
						/><select
							name="courseId"
							required
							value={selectedCourseId}
							onchange={updateManualCourse}
							><option value="">과목 선택</option
							>{#each filteredCourses as course (course.id)}<option value={course.id}
									>[{course.id}] {course.name}</option
								>{/each}</select
						></label
					>
					<label
						><span>연도</span><input
							type="number"
							name="year"
							min="2022"
							value={new Date().getFullYear()}
						/></label
					>
					<label
						><span>학기</span><select name="term"
							><option value="1">1학기</option><option value="2">2학기</option><option value="3"
								>하계</option
							><option value="4">동계</option></select
						></label
					>
					<div class="credit-readout" aria-live="polite">
						<span>학점</span>
						<strong class:empty={!selectedManualCourse}
							>{selectedManualCourse
								? selectedManualCourse.creditType === 'pass'
									? 'P'
									: `${manualCredits}학점`
								: '강의를 선택하세요'}</strong
						>
						<input type="hidden" name="credits" value={manualCredits} />
					</div>
					<label
						><span>결과</span><select name="status"
							><option value="passed">이수</option><option value="failed">낙제</option><option
								value="withdrawn">수강 철회</option
							></select
						></label
					>
					<label
						><span>성적 <small>(선택)</small></span><input
							name="grade"
							placeholder="A+, P 등"
						/></label
					>
					{#if manualAddError}<p class="warning" aria-live="polite">{manualAddError}</p>{/if}
					<button>수강 이력에 추가</button>
				</form>
			</RecordEntryDialog>
			<RecordEntryDialog
				title="학점교류 과목 추가"
				description="인정 학점은 자유선택(FR)으로 반영됩니다"
				bind:open={exchangeAddOpen}
			>
				{#snippet icon()}<GraduationCap size="1rem" />{/snippet}
				<form method="POST" action="?/addExternalCompletion" class="completion-form">
					<label
						><span>대학명</span><input name="institution" placeholder="대학명" required /></label
					>
					<label
						><span>과목코드</span><input name="courseCode" placeholder="과목코드" required /></label
					>
					<label class="course-select"
						><span>과목명</span><input name="courseName" placeholder="과목명" required /></label
					>
					<label
						><span>연도</span><input
							type="number"
							name="year"
							min="2022"
							value={new Date().getFullYear()}
							required
						/></label
					>
					<label
						><span>학기</span><select name="term"
							><option value="1">1학기</option><option value="2">2학기</option><option value="3"
								>하계</option
							><option value="4">동계</option></select
						></label
					>
					<label
						><span>인정학점</span><input
							type="number"
							name="credits"
							min="0"
							step="0.5"
							value="3"
							required
						/></label
					>
					<label
						><span>결과</span><select name="status"
							><option value="passed">이수</option><option value="failed">낙제</option><option
								value="withdrawn">수강 철회</option
							></select
						></label
					>
					<label
						><span>성적 <small>(선택)</small></span><input
							name="grade"
							placeholder="A+, P 등"
						/></label
					>
					<button>수강 이력에 추가</button>
				</form>
			</RecordEntryDialog>
		</div>

		{#if completionGroups.length}
			<div class="record-groups">
				{#each completionGroups as [period, completions] (period)}
					<details class="record-group" open={historyQuery.trim().length > 0}>
						<summary>
							<span class="record-period"
								><b>{completions[0].year}년 {termLabel(completions[0].term)}</b><small
									>{completions.length}과목</small
								></span
							>
							<span class="disclosure-icon"><ChevronDown size="0.9rem" /></span>
						</summary>
						<ul>
							{#each completions as completion (completion.id)}
								<li>
									<div class="course-copy">
										<b>{completion.courseName}</b><span
											>{completion.courseCode} · {completion.credits === 0
												? 'P'
												: `${completion.credits}학점`}{completion.grade
												? ` · ${completion.grade}`
												: ''}{completion.isExternal
												? ` · 학점교류 · ${completion.institution}`
												: ''}{completion.isCreditRecognition ? ' · AP 학점 인정' : ''}</span
										>
									</div>
									<span
										class:failed={completion.status === 'failed'}
										class:withdrawn={completion.status === 'withdrawn'}
										class="status-badge">{statusLabel(completion.status)}</span
									>
									<form method="POST" action="?/removeCompletion">
										<input type="hidden" name="completionId" value={completion.id} /><button
											class="remove-button"
											aria-label={`${completion.courseName} 삭제`}
											title="삭제"><Trash size="0.85rem" /></button
										>
									</form>
								</li>
							{/each}
						</ul>
					</details>
				{/each}
			</div>
		{:else}
			<div class="empty-records">
				<BookOpenCheck size="1.4rem" />
				<p>{historyQuery ? '검색 결과가 없습니다.' : '아직 등록된 수강 이력이 없습니다.'}</p>
			</div>
		{/if}
	</section>

	<details class="module profile-settings" open={!data.academicProfile}>
		<summary
			><Settings2 size="1rem" /><span
				><b>학사 기준 설정</b><small>입학연도와 ESP 면제 과목</small></span
			><span class="disclosure-icon"><ChevronDown size="0.9rem" /></span></summary
		>
		<form method="POST" action="?/saveAcademicProfile">
			<label
				><span>입학연도</span><input
					type="number"
					name="admissionYear"
					min="2022"
					max="2100"
					value={data.academicProfile?.admissionYear ?? new Date().getFullYear()}
					required
				/></label
			>
			<fieldset class="esp-waivers">
				<legend>ESP 면제 과목</legend>
				<p>배치 결과로 수강하지 않아도 되는 과목만 선택하세요.</p>
				<div>
					{#each data.espCourses as course (course.id)}
						<label>
							<input
								type="checkbox"
								name="espWaivedCourseIds"
								value={course.id}
								checked={data.academicProfile?.espWaivedCourseIds.includes(course.id) ?? false}
							/>
							<span>{course.name}</span>
						</label>
					{/each}
				</div>
			</fieldset>
			<button class="profile-save"><Check size="0.78rem" />저장</button>
		</form>
	</details>
</section>

<style lang="scss">
	.academic-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}
	.section-header,
	.section-title,
	.setup-callout,
	.profile-settings summary,
	.search-field,
	.detail-card summary {
		display: flex;
		align-items: center;
	}
	.section-title p,
	.setup-callout p {
		margin: 0;
		color: var(--gray-text);
		font-size: 0.84rem;
	}
	.overview-card,
	.detail-card,
	.records-card,
	.setup-callout,
	.profile-settings {
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.8rem;
		background: var(--white);
	}
	.overview-card {
		display: grid;
		grid-template-columns: minmax(13rem, 0.8fr) minmax(20rem, 1.4fr);
		gap: 1.25rem;
		padding: 1.15rem;
	}
	.total-progress {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		border-right: var(--divider-border-width) solid var(--gray-border);
	}
	.progress-ring {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 50%;
		background: conic-gradient(var(--secondary) var(--progress), var(--gray-bg) 0);
		width: 5.7rem;
		height: 5.7rem;
	}
	.progress-ring.complete {
		background: var(--success-text);
	}
	.progress-ring::before {
		grid-area: 1/1;
		border-radius: 50%;
		background: white;
		width: 4.55rem;
		height: 4.55rem;
		content: '';
	}
	.progress-ring div {
		display: flex;
		grid-area: 1/1;
		flex-direction: column;
		align-items: center;
		z-index: 1;
	}
	.progress-ring strong {
		font-size: 1.2rem;
	}
	.progress-ring span {
		color: var(--gray-text);
		font-size: 0.62rem;
	}
	.total-copy {
		display: flex;
		flex-direction: column;
	}
	.academic-basis {
		display: flex;
		align-items: center;
		gap: 0.28rem;
		margin-bottom: 0.25rem;
		color: var(--secondary);
		font-weight: 600;
		font-size: 0.64rem;
		white-space: nowrap;
	}
	.academic-basis i {
		border-radius: 50%;
		background: var(--gray-border);
		width: 0.18rem;
		height: 0.18rem;
	}
	.total-copy > span,
	.total-copy p {
		color: var(--gray-text);
		font-size: 0.73rem;
	}
	.total-copy strong {
		font-size: 1.55rem;
	}
	.total-copy strong small {
		color: var(--gray-text);
		font-weight: 500;
		font-size: 0.72rem;
	}
	.total-copy p {
		margin: 0.15rem 0 0;
	}
	.total-copy p.complete {
		color: var(--success-text);
		font-weight: 600;
	}
	.category-progress {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-content: center;
		gap: 0.55rem 1rem;
	}
	.requirement-row {
		display: grid;
		grid-template-columns: minmax(2.8rem, auto) 1fr 2.7rem;
		align-items: center;
		gap: 0.45rem;
	}
	.requirement-row > div:first-child {
		display: flex;
		font-size: 0.72rem;
	}
	.category-code {
		align-items: center;
		gap: 0.2rem;
		font-weight: 650;
	}
	.category-code :global(svg) {
		color: var(--success-text);
	}
	.requirement-row small {
		color: var(--gray-text);
		font-weight: 500;
		font-size: 0.58rem;
	}
	.requirement-row > b {
		font-size: 0.72rem;
		text-align: right;
	}
	.bar {
		border-radius: 999px;
		background: var(--gray-bg);
		height: 0.38rem;
		overflow: hidden;
	}
	.bar i {
		display: block;
		border-radius: inherit;
		background: var(--secondary);
		height: 100%;
	}
	.requirement-row.complete .bar i {
		background: var(--success-text);
	}
	.requirement-row.complete > b,
	.requirement-row.complete .category-code {
		color: var(--success-text);
	}
	.detail-card {
		padding: 0;
		overflow: hidden;
	}
	.detail-card summary {
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.7rem 0.85rem;
		list-style: none;
	}
	.detail-card summary::-webkit-details-marker {
		display: none;
	}
	.detail-card summary > span:not(.disclosure-icon) {
		display: flex;
		flex-direction: column;
	}
	.detail-card summary small {
		color: var(--gray-text);
		font-weight: 400;
		font-size: 0.68rem;
	}
	.detail-card summary > :global(svg) {
		color: var(--secondary);
	}
	.records-card {
		padding: 1rem;
	}
	.section-title {
		gap: 0.55rem;
	}
	.section-title > :global(svg) {
		color: var(--secondary);
	}
	.section-title h2 {
		margin: 0;
		font-size: 1rem;
	}
	.section-title p {
		font-size: 0.72rem;
	}
	.detail-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
		gap: 0.5rem;
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding: 0.75rem;
	}
	.detail-grid > div {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		border: var(--divider-border-width) solid transparent;
		border-radius: 0.55rem;
		background: var(--gray-bg);
		padding: 0.65rem;
	}
	.detail-grid > div.complete {
		border-color: color-mix(in srgb, var(--success-text) 20%, transparent);
		background: var(--success-bg);
	}
	.detail-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}
	.detail-label small {
		border-radius: 999px;
		background: color-mix(in srgb, var(--secondary) 10%, var(--white));
		padding: 0.12rem 0.35rem;
		color: var(--secondary);
		font-weight: 600;
		font-size: 0.58rem;
	}
	.complete .detail-label small {
		background: color-mix(in srgb, var(--success-text) 10%, var(--white));
		color: var(--success-text);
	}
	.detail-grid span {
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.detail-grid b {
		font-size: 1rem;
	}
	.detail-grid b small {
		margin-left: 0.12rem;
		color: var(--gray-text);
		font-size: 0.62rem;
	}
	.detail-bar {
		border-radius: 999px;
		background: color-mix(in srgb, var(--gray-border) 65%, transparent);
		height: 0.36rem;
		overflow: hidden;
	}
	.detail-bar i {
		display: block;
		transition: width 0.2s ease;
		border-radius: inherit;
		background: var(--secondary);
		height: 100%;
	}
	.complete .detail-bar i {
		background: var(--success-text);
	}
	.detail-grid .esp-detail {
		grid-column: 1 / -1;
	}
	.esp-course-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr));
		gap: 0.3rem;
	}
	.esp-course-list > span {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		border: var(--divider-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		background: var(--white);
		padding: 0.35rem 0.4rem;
	}
	.esp-course-list > span.complete {
		border-color: color-mix(in srgb, var(--success-text) 25%, var(--gray-border));
		color: var(--success-text);
	}
	.esp-course-list > span :global(svg) {
		flex: 0 0 auto;
	}
	.esp-course-list b {
		flex: 1;
		font-size: 0.64rem;
		line-height: 1.25;
	}
	.esp-course-list small {
		flex: 0 0 auto;
		color: var(--success-text);
		font-size: 0.55rem;
	}
	.esp-detail p {
		margin: 0.1rem 0 0;
		color: var(--secondary);
		font-size: 0.67rem;
	}
	.setup-callout {
		justify-content: center;
		gap: 0.8rem;
		padding: 1.4rem;
	}
	.setup-callout :global(svg) {
		color: var(--secondary);
	}
	.setup-callout h2 {
		margin: 0 0 0.1rem;
		font-size: 1rem;
	}
	.section-header {
		justify-content: space-between;
		gap: 0.75rem;
	}
	.search-field {
		gap: 0.35rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.5rem;
		padding-left: 0.55rem;
		color: var(--gray-text);
	}
	.search-field input {
		border: 0;
		width: 11rem;
	}
	.record-tools {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		align-items: start;
		gap: 0.65rem;
		margin-top: 0.9rem;
	}
	.completion-form {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.55rem;
	}
	.completion-form label {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.completion-form label > span {
		font-weight: 600;
		font-size: 0.72rem;
	}
	.credit-readout {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		gap: 0.2rem;
		min-width: 0;
	}
	.credit-readout > span {
		font-weight: 600;
		font-size: 0.72rem;
	}
	.credit-readout strong {
		padding: 0.2rem 0;
		font-size: 0.8rem;
		line-height: 1.5;
	}
	.credit-readout strong.empty {
		color: var(--gray-text);
		font-weight: 400;
	}
	.completion-form .course-select,
	.completion-form .warning,
	.completion-form button {
		grid-column: 1 / -1;
	}
	.completion-form .warning {
		margin: 0;
		color: var(--error-text);
		font-size: 0.78rem;
	}
	.course-select input {
		margin-bottom: 0.15rem;
	}
	.completion-form button {
		border-color: var(--secondary);
		background: var(--secondary);
		color: white;
	}
	.record-groups {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		margin-top: 1rem;
	}
	.record-group {
		border: var(--divider-border-width) solid var(--gray-border);
		border-radius: 0.45rem;
		overflow: hidden;
	}
	.record-group summary {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.55rem 0.65rem;
		list-style: none;
	}
	.record-group summary::-webkit-details-marker {
		display: none;
	}
	.record-group summary:hover {
		background: var(--gray-bg);
	}
	.record-period {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		min-width: 0;
	}
	.record-period b {
		font-size: 0.73rem;
	}
	.record-period small {
		border-radius: 999px;
		background: var(--gray-bg);
		padding: 0.12rem 0.35rem;
		color: var(--gray-text);
		font-weight: 500;
		font-size: 0.6rem;
	}
	.record-group ul {
		margin: 0;
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding: 0 0.55rem;
		list-style: none;
	}
	.record-group li {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: 0.65rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		padding: 0.55rem 0.25rem;
	}
	.record-group li:last-child {
		border-bottom: 0;
	}
	.course-copy {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.course-copy b {
		overflow: hidden;
		font-size: 0.8rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.course-copy span {
		color: var(--gray-text);
		font-size: 0.68rem;
	}
	.status-badge {
		border-radius: 999px;
		background: var(--success-bg);
		padding: 0.2rem 0.45rem;
		color: var(--success-text);
		font-weight: 600;
		font-size: 0.65rem;
	}
	.status-badge.failed {
		background: var(--error-bg);
		color: var(--error-text);
	}
	.status-badge.withdrawn {
		background: var(--gray-bg);
		color: var(--gray-text);
	}
	.remove-button {
		display: grid;
		place-items: center;
		border: 0;
		background: transparent;
		padding: 0.3rem;
		color: var(--gray-text);
	}
	.remove-button:hover {
		color: var(--error-text);
	}
	.empty-records {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		padding: 2.5rem;
		color: var(--gray-text);
		text-align: center;
	}
	.empty-records p {
		margin: 0;
		font-size: 0.8rem;
	}
	.profile-settings summary {
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.7rem 0.85rem;
		list-style: none;
	}
	.profile-settings summary::-webkit-details-marker {
		display: none;
	}
	.profile-settings summary > span:not(.disclosure-icon) {
		display: flex;
		flex-direction: column;
	}
	.profile-settings summary > :global(svg) {
		color: var(--secondary);
	}
	.disclosure-icon {
		display: grid !important;
		flex: 0 0 auto;
		place-items: center;
		transition: transform 0.18s ease;
		margin-left: auto;
		color: var(--gray-text);
	}
	details[open] > summary .disclosure-icon {
		transform: rotate(180deg);
	}
	.profile-settings summary small {
		color: var(--gray-text);
		font-weight: 400;
		font-size: 0.68rem;
	}
	.profile-settings form {
		display: grid;
		grid-template-columns: minmax(8rem, 10rem) minmax(0, 1fr);
		column-gap: 1rem;
		row-gap: 0.7rem;
		align-items: start;
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding: 0.75rem 0.85rem 0.85rem;
	}
	.profile-settings label {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.profile-settings label span {
		font-weight: 600;
		font-size: 0.72rem;
	}
	.profile-settings form > label input {
		width: 100%;
	}
	.esp-waivers legend {
		font-weight: 600;
		font-size: 0.72rem;
	}
	.esp-waivers > p {
		margin: 0.15rem 0 0.4rem;
		color: var(--gray-text);
		font-size: 0.68rem;
	}
	.esp-waivers > div {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}
	.esp-waivers label {
		flex-direction: row;
		align-items: center;
		gap: 0.3rem;
		cursor: pointer;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.45rem;
		background: var(--white);
		padding: 0.28rem 0.42rem;
	}
	.esp-waivers label:has(input:checked) {
		border-color: var(--secondary);
		background: var(--secondary-bg);
	}
	.esp-waivers input {
		flex: 0 0 auto;
	}
	.profile-settings .profile-save {
		display: flex;
		grid-column: 2;
		align-items: center;
		justify-self: end;
		gap: 0.25rem;
		border-color: var(--secondary);
		background: var(--secondary);
		padding: 0.32rem 0.58rem;
		color: var(--white);
		font-size: 0.7rem;
	}
	.profile-settings .profile-save:hover {
		background: color-mix(in srgb, var(--secondary) 88%, black);
	}
	@media (max-width: 850px) {
		.overview-card {
			grid-template-columns: 1fr;
		}
		.total-progress {
			border-right: 0;
			border-bottom: var(--divider-border-width) solid var(--gray-border);
			padding-bottom: 1rem;
		}
		.record-tools {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 600px) {
		.completion-form {
			grid-template-columns: 1fr;
		}
		.category-progress {
			grid-template-columns: 1fr;
		}
		.section-header {
			flex-direction: column;
			align-items: stretch;
		}
		.search-field input {
			width: 100%;
		}
		.profile-settings form {
			grid-template-columns: 1fr;
		}
		.profile-settings .profile-save {
			grid-column: 1;
		}
		.detail-grid .esp-detail {
			grid-column: auto;
		}
	}
</style>
