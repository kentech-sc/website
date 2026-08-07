<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import CheckCircle from '@lucide/svelte/icons/circle-check-big';
	import Clock from '@lucide/svelte/icons/clock-3';
	import Copy from '@lucide/svelte/icons/copy';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
	import ImageDown from '@lucide/svelte/icons/image-down';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import Trash from '@lucide/svelte/icons/trash-2';
	import Users from '@lucide/svelte/icons/users';
	import X from '@lucide/svelte/icons/x';

	import CourseSearchPanel from './_components/CourseSearchPanel.svelte';
	import UnscheduledCourseLane from './_components/UnscheduledCourseLane.svelte';

	import type { CourseSearchFilter } from './_components/course-search.js';
	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { navigating } from '$app/state';
	import AcademicHeader from '$components/AcademicHeader.svelte';

	let { data } = $props();
	let selectedId = $state<string | null>(null);
	let selectedTerm = $derived(String(data.term));
	let editingName = $state(false);
	let renameError = $state('');
	let submitting = $state(false);
	let savingImage = $state(false);
	let searchFilter = $state<CourseSearchFilter | null>(null);
	let searchSession = $state(0);
	let schedulePanel = $state<HTMLElement | null>(null);

	const actualId = 'actual';
	const selected = $derived(data.timetables.find((item) => item.id === selectedId) ?? null);
	const actualSelected = $derived(
		selectedId === actualId && data.actualSchedule.completions.length > 0
	);
	const displayOfferings = $derived(
		actualSelected ? data.actualSchedule.offerings : (selected?.offerings ?? [])
	);
	const busy = $derived(submitting || navigating.to !== null);
	const hiddenSelectedOfferings = $derived(
		selected?.offerings.filter(
			(offering) =>
				!offering.meetings.some((meeting) => meeting.weekday >= 1 && meeting.weekday <= 5)
		) ?? []
	);
	const progress = $derived(
		actualSelected
			? data.degreeProgress
			: selected
				? data.timetableProgress[selected.id]
				: data.degreeProgress
	);
	const espProgress = $derived(
		progress?.sequenceProgress.find((item) => item.category === 'ESP') ?? null
	);
	const baselineProgress = $derived(data.degreeProgress);
	const baselineEspProgress = $derived(
		baselineProgress?.sequenceProgress.find((item) => item.category === 'ESP') ?? null
	);
	const degreeTotalBaseline = $derived(
		baselineProgress?.earned.total ?? progress?.earned.total ?? 0
	);
	const degreeTotalDelta = $derived(
		progress ? Math.max(0, progress.earned.total - degreeTotalBaseline) : 0
	);
	const degreeTotalBaselinePercent = $derived(
		progress ? requirementPercent(degreeTotalBaseline, progress.required.total) : 0
	);
	const degreeTotalPercent = $derived(
		progress ? requirementPercent(progress.earned.total, progress.required.total) : 0
	);
	const degreeCategoryProgress = $derived(
		progress
			? Object.entries(progress.required)
					.filter(([key]) => key !== 'total')
					.map(([key, required]) => {
						const value = earned(key);
						const baseline = baselineEarned(key, value);
						return { key, value, baseline, delta: Math.max(0, value - baseline), required };
					})
			: []
	);
	const degreeDetailProgress = $derived(
		progress
			? [
					{
						key: 'ef-math',
						label: 'EF 수학',
						value: progress.efSub.math,
						baseline: baselineProgress?.efSub.math ?? progress.efSub.math,
						required: progress.efSubRequired.math,
						unit: '학점'
					},
					{
						key: 'ef-physics',
						label: 'EF 물리',
						value: progress.efSub.physics,
						baseline: baselineProgress?.efSub.physics ?? progress.efSub.physics,
						required: progress.efSubRequired.physics,
						unit: '학점'
					},
					{
						key: 'ef-chemistry',
						label: 'EF 화학',
						value: progress.efSub.chemistry,
						baseline: baselineProgress?.efSub.chemistry ?? progress.efSub.chemistry,
						required: progress.efSubRequired.chemistry,
						unit: '학점'
					},
					{
						key: 'ef-data-literacy',
						label: 'EF 데이터',
						value: progress.efSub.dataLiteracy,
						baseline: baselineProgress?.efSub.dataLiteracy ?? progress.efSub.dataLiteracy,
						required: progress.efSubRequired.dataLiteracy,
						unit: '학점'
					},
					{
						key: 'el-upper',
						label: 'EL 4·5레벨',
						value: progress.elUpperCredits,
						baseline: baselineProgress?.elUpperCredits ?? progress.elUpperCredits,
						required: progress.elUpperRequiredCredits,
						unit: '학점'
					},
					...(espProgress
						? [
								{
									key: 'esp-courses',
									label: 'ESP 필수 수업',
									value: espProgress.completedCount,
									baseline: baselineEspProgress?.completedCount ?? espProgress.completedCount,
									required: espProgress.totalCount,
									unit: '수업'
								}
							]
						: [])
				]
			: []
	);
	const selectedMeetings = $derived(displayOfferings.flatMap((offering) => offering.meetings));
	const startMinute = $derived(
		selectedMeetings.length
			? Math.min(
					9 * 60,
					Math.floor(Math.min(...selectedMeetings.map((meeting) => meeting.startsAt)) / 60) * 60
				)
			: 9 * 60
	);
	const endMinute = 20 * 60;
	const timeLabels = $derived(
		Array.from(
			{ length: Math.floor((endMinute - startMinute) / 60) + 1 },
			(_, index) => startMinute + index * 60
		)
	);
	const gridStep = 1.35;
	const gridPadding = 0.65;
	const courseSlots = [
		{ startsAt: 9 * 60, endsAt: 11 * 60 },
		{ startsAt: 12 * 60, endsAt: 14 * 60 },
		{ startsAt: 14 * 60, endsAt: 16 * 60 },
		{ startsAt: 16 * 60, endsAt: 18 * 60 },
		{ startsAt: 18 * 60, endsAt: 20 * 60 }
	] as const;
	const scheduleGuides = [9, 11, 12, 14, 16, 18, 20].map((hour) => hour * 60);
	const gridHeight = $derived(((endMinute - startMinute) / 30) * gridStep + gridPadding * 2);
	const totalCredits = $derived(
		actualSelected
			? data.actualSchedule.completions
					.filter((completion) => completion.status === 'passed')
					.reduce((sum, completion) => sum + completion.credits, 0)
			: displayOfferings.reduce((sum, offering) => sum + offering.credits, 0)
	);
	const totalHours = $derived(
		displayOfferings.reduce(
			(sum, offering) =>
				sum +
				offering.meetings.reduce(
					(meetingSum, meeting) => meetingSum + meeting.endsAt - meeting.startsAt,
					0
				),
			0
		) / 60
	);

	const weekdays = ['월', '화', '수', '목', '금'];
	const categoryColors: Record<string, string> = {
		EL: '#315f9e',
		EF: '#247f9f',
		VC: '#5b7f8d',
		MN: '#735f99',
		HASS: '#8b6b83',
		ESP: '#a45d7d',
		IR: '#b86446',
		CAPS: '#a44c3c',
		EN: '#6653a3',
		FR: '#647078',
		RC: '#39786f'
	};

	function earned(categoryKey: string): number {
		return progress ? ((progress.earned as Record<string, number>)[categoryKey] ?? 0) : 0;
	}
	function baselineEarned(categoryKey: string, fallback: number): number {
		return baselineProgress
			? ((baselineProgress.earned as Record<string, number>)[categoryKey] ?? 0)
			: fallback;
	}
	function requirementPercent(value: number, required: number): number {
		return required <= 0 ? 100 : Math.min(100, Math.round((value / required) * 100));
	}
	function courseColor(categoryKey: string | null): string {
		return categoryColors[categoryKey ?? ''] ?? '#526777';
	}
	function meetingsForDay(day: number) {
		return displayOfferings.flatMap((offering) =>
			offering.meetings
				.filter((meeting) => meeting.weekday === day)
				.map((meeting) => ({ offering, meeting }))
		);
	}
	function formatTime(minutes: number): string {
		return `${Math.floor(minutes / 60)
			.toString()
			.padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
	}
	function scheduleText(offering: (typeof data.offerings)[number]): string {
		if (!offering.meetings.length) return '시간 미정';
		return offering.meetings
			.map(
				(meeting) =>
					`${weekdays[meeting.weekday - 1] ?? meeting.weekday} ${formatTime(meeting.startsAt)}–${formatTime(meeting.endsAt)}${meeting.room ? ` · ${meeting.room}` : ''}`
			)
			.join(' / ');
	}
	function meetingStyle(categoryKey: string | null, startsAt: number, endsAt: number): string {
		const top = gridPadding + ((startsAt - startMinute) / 30) * gridStep;
		const height = Math.max(1.15, ((endsAt - startsAt) / 30) * gridStep);
		return `--course-color: ${courseColor(categoryKey)}; top: ${top}rem; height: ${height}rem`;
	}
	function gridSlotStyle(startsAt: number, endsAt: number): string {
		const inset = 0.08;
		const top = gridPadding + ((startsAt - startMinute) / 30) * gridStep + inset;
		const height = ((endsAt - startsAt) / 30) * gridStep - inset * 2;
		return `top: ${top}rem; height: ${height}rem`;
	}
	function scheduleGuideStyle(minute: number): string {
		return `top: ${gridPadding + ((minute - startMinute) / 30) * gridStep}rem`;
	}
	function slotOccupied(weekday: number, startsAt: number, endsAt: number): boolean {
		return displayOfferings.some((offering) =>
			offering.meetings.some(
				(meeting) =>
					meeting.weekday === weekday && meeting.startsAt < endsAt && startsAt < meeting.endsAt
			)
		);
	}
	function openSearch(filter: CourseSearchFilter): void {
		if (!selected || busy) return;
		searchFilter = filter;
		searchSession += 1;
	}
	function openSlotPicker(weekday: number, minute: number): void {
		openSearch({ kind: 'slot', weekday, minute });
	}
	function openCourseBrowser(): void {
		openSearch({ kind: 'all' });
	}
	function openUnscheduledBrowser(): void {
		openSearch({ kind: 'unscheduled' });
	}
	function closeCourseBrowser(): void {
		searchFilter = null;
	}
	function clearCourseSearchFilter(): void {
		if (searchFilter) searchFilter = { kind: 'all' };
	}
	async function saveScheduleImage(): Promise<void> {
		if (!schedulePanel || savingImage) return;
		savingImage = true;
		try {
			const { toPng } = await import('html-to-image');
			const dataUrl = await toPng(schedulePanel, { pixelRatio: 2 });
			const filename = `${actualSelected ? '실제 수강' : (selected?.name ?? '시간표')}.png`;
			const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
			if (isTouchDevice) {
				const blob = await (await fetch(dataUrl)).blob();
				const file = new File([blob], filename, { type: 'image/png' });
				if (navigator.canShare?.({ files: [file] })) {
					try {
						await navigator.share({ files: [file], title: filename });
					} catch (error) {
						if (error instanceof DOMException && error.name === 'AbortError') return;
						throw error;
					}
					return;
				}
			}
			const link = document.createElement('a');
			link.href = dataUrl;
			link.download = filename;
			link.click();
		} catch (error) {
			console.error('시간표 이미지 저장 오류:', error);
			alert(error instanceof Error ? error.message : '이미지를 저장하지 못했습니다.');
		} finally {
			savingImage = false;
		}
	}
	const pendingEnhance: SubmitFunction = () => {
		submitting = true;
		return async ({ update }) => {
			try {
				await update();
			} finally {
				submitting = false;
			}
		};
	};
	const deleteEnhance: SubmitFunction = (input) => {
		if (!confirm('이 시간표를 삭제할까요?')) {
			input.cancel();
			return;
		}
		return pendingEnhance(input);
	};
	const renameEnhance: SubmitFunction = () => {
		renameError = '';
		submitting = true;
		return async ({ result, update }) => {
			try {
				if (result.type === 'failure') {
					renameError = String(result.data?.message ?? '시간표 이름을 저장하지 못했습니다.');
					await update({ reset: false });
					return;
				}
				editingName = false;
				await update();
			} finally {
				submitting = false;
			}
		};
	};

	$effect(() => {
		const validSelection =
			(selectedId === actualId && data.actualSchedule.completions.length > 0) ||
			data.timetables.some((item) => item.id === selectedId);
		if (!validSelection) {
			selectedId = data.actualSchedule.completions.length
				? actualId
				: (data.timetables[0]?.id ?? null);
		}
	});
</script>

<section class="timetable-page" aria-busy={busy}>
	<AcademicHeader
		title="시간표"
		description="여러 시간표를 비교하고 하나를 확정하세요."
		canManageCatalog={data.canManageCatalog}
	/>

	<div class="module planner-controls">
		<form method="GET" class="term-picker">
			<input name="year" type="number" min="2022" value={data.year} aria-label="연도" />
			<select name="term" bind:value={selectedTerm} aria-label="학기"
				><option value="1">1학기</option><option value="2">2학기</option><option value="3"
					>하계</option
				><option value="4">동계</option></select
			>
			<button class="term-submit" aria-label="선택한 학기 열기" title="선택한 학기 열기">
				<ArrowRight size="0.9rem" />
			</button>
		</form>

		<nav class="slot-tabs" aria-label="시간표 목록">
			{#if data.actualSchedule.completions.length}
				<button
					class="slot-button actual-slot"
					class:active={actualSelected}
					aria-pressed={actualSelected}
					onclick={() => {
						selectedId = actualId;
						editingName = false;
					}}
				>
					<CheckCircle size="0.82rem" /><span>실제 수강</span>
				</button>
			{/if}
			{#each data.timetables as timetable (timetable.id)}
				<button
					class="slot-button"
					class:active={selectedId === timetable.id}
					aria-pressed={selectedId === timetable.id}
					onclick={() => {
						selectedId = timetable.id;
						editingName = false;
					}}
				>
					<span>{timetable.name}</span>
					{#if timetable.isConfirmed}
						<span class="confirmed-marker" aria-label="확정된 시간표">
							<CheckCircle size="0.88rem" aria-hidden="true" />
						</span>
					{/if}
				</button>
			{/each}
			<form method="POST" action="?/create" use:enhance={pendingEnhance} class="create-slot">
				<input type="hidden" name="year" value={data.year} /><input
					type="hidden"
					name="term"
					value={data.term}
				/>
				<button aria-label="시간표 추가" title="시간표 추가"><Plus size="0.85rem" /></button>
			</form>
		</nav>
	</div>

	{#if actualSelected || selected}
		{#if actualSelected}
			<section class="module slot-toolbar actual-toolbar">
				<div class="slot-title">
					<h2>실제 수강</h2>
					<span class="actual-badge"><CheckCircle size="0.78rem" />수강 기록</span>
				</div>
				<div class="slot-stats">
					<span><b>{data.actualSchedule.completions.length}</b>과목</span><span
						><b>{totalCredits}</b>인정학점</span
					><span
						><b>{Number.isInteger(totalHours) ? totalHours : totalHours.toFixed(1)}</b>시간/주</span
					>
				</div>
			</section>
		{:else if selected}
			<section class="module slot-toolbar">
				<div class="slot-title">
					{#if editingName}
						<form method="POST" action="?/rename" use:enhance={renameEnhance}>
							<input type="hidden" name="timetableId" value={selected.id} />
							<input name="name" value={selected.name} aria-label="시간표 이름" />
							<button>저장</button>
							<button
								type="button"
								onclick={() => {
									editingName = false;
									renameError = '';
								}}>취소</button
							>
							{#if renameError}<p class="rename-error" aria-live="polite">{renameError}</p>{/if}
						</form>
					{:else}
						<h2>{selected.name}</h2>
						<button
							class="edit-name"
							type="button"
							onclick={() => (editingName = true)}
							aria-label="시간표 이름 변경"
							title="이름 변경"><Pencil size="0.75rem" /></button
						>
					{/if}
					{#if selected.isConfirmed}<span class="confirmed-badge"
							><CheckCircle size="0.78rem" />확정</span
						>{/if}
				</div>
				<div class="slot-stats">
					<span><b>{selected.offerings.length}</b>과목</span><span><b>{totalCredits}</b>학점</span
					><span
						><b>{Number.isInteger(totalHours) ? totalHours : totalHours.toFixed(1)}</b>시간/주</span
					>
				</div>
				<div class="slot-actions">
					<form
						method="POST"
						action={selected.isConfirmed ? '?/unconfirm' : '?/confirm'}
						use:enhance={pendingEnhance}
					>
						<input type="hidden" name="timetableId" value={selected.id} /><button
							class:confirm-button={!selected.isConfirmed}
							class:unconfirm-button={selected.isConfirmed}
							disabled={!selected.isConfirmed && !selected.offerings.length}
							>{#if selected.isConfirmed}<X size="0.85rem" />확정 취소{:else}<Check
									size="0.85rem"
								/>확정{/if}</button
						>
					</form>
					<div class="slot-utilities">
						<button
							type="button"
							class="icon-button"
							disabled={savingImage || !selected.offerings.length}
							onclick={saveScheduleImage}
							aria-label="시간표 이미지 저장"
							title="이미지로 저장/공유"><ImageDown size="0.85rem" /></button
						>
						<form method="POST" action="?/copy" use:enhance={pendingEnhance}>
							<input type="hidden" name="timetableId" value={selected.id} /><button
								class="icon-button"
								aria-label="시간표 복제"
								title="시간표 복제"><Copy size="0.85rem" /></button
							>
						</form>
						<form method="POST" action="?/delete" use:enhance={deleteEnhance}>
							<input type="hidden" name="timetableId" value={selected.id} /><button
								class="icon-button danger-button"
								aria-label="시간표 삭제"
								title="시간표 삭제"><Trash size="0.85rem" /></button
							>
						</form>
					</div>
				</div>
			</section>
		{/if}

		<div class="planner-workspace" class:search-open={searchFilter !== null}>
			<div class="planner-main">
				<section
					class="module schedule-panel"
					bind:this={schedulePanel}
					aria-label={actualSelected ? '실제 수강 시간표' : `${selected?.name ?? '시간표'} 시간표`}
				>
					{#if selected && displayOfferings.length === 0}
						<div class="schedule-onboarding">
							<span class="onboarding-icon"><Plus size="0.9rem" aria-hidden="true" /></span>
							<span>
								<strong>빈 칸을 눌러 강의를 추가하세요</strong>
								<small>선택한 요일과 시간에 맞는 강의만 바로 보여드려요.</small>
							</span>
							<button type="button" disabled={busy} onclick={openCourseBrowser}
								><Search size="0.82rem" />전체 강의 검색</button
							>
						</div>
					{:else if selected}
						<div class="schedule-toolbar">
							<button type="button" disabled={busy} onclick={openCourseBrowser}
								><Search size="0.82rem" />전체 강의 검색</button
							>
						</div>
					{/if}
					<div class="schedule-scroll">
						<div class="schedule-grid">
							<div class="corner">시간</div>
							{#each weekdays as weekday (weekday)}<div class="day-header">{weekday}</div>{/each}
							<div class="time-axis" style={`height: ${gridHeight}rem`}>
								{#each timeLabels as minute (minute)}<span
										style={`top: ${gridPadding + ((minute - startMinute) / 30) * gridStep}rem`}
										>{formatTime(minute)}</span
									>{/each}
							</div>
							{#each weekdays as weekday, day (weekday)}
								<div class="day-lane" style={`height: ${gridHeight}rem`}>
									{#each scheduleGuides as minute (minute)}
										<span
											class="schedule-guide"
											style={scheduleGuideStyle(minute)}
											aria-hidden="true"
										></span>
									{/each}
									{#if selected && day !== 2}
										{#each courseSlots as slot (slot.startsAt)}
											{#if !slotOccupied(day + 1, slot.startsAt, slot.endsAt)}
												<button
													type="button"
													class="grid-slot"
													tabindex="-1"
													style={gridSlotStyle(slot.startsAt, slot.endsAt)}
													disabled={busy}
													onclick={() => openSlotPicker(day + 1, slot.startsAt)}
													aria-label={`${weekday} ${formatTime(slot.startsAt)}에 강의 추가`}
													title={`${weekday} ${formatTime(slot.startsAt)} 강의 찾기`}
												>
													<Plus size="0.78rem" aria-hidden="true" />
												</button>
											{/if}
										{/each}
									{/if}
									{#each meetingsForDay(day + 1) as { offering, meeting } (`${offering.id}-${meeting.id}`)}
										<article
											class="course-block"
											style={meetingStyle(offering.category, meeting.startsAt, meeting.endsAt)}
											title={`${offering.courseName} · ${scheduleText(offering)}`}
										>
											<button
												type="button"
												class="course-block-copy"
												aria-disabled={!selected}
												tabindex={selected ? 0 : -1}
												onclick={() => openSlotPicker(meeting.weekday, meeting.startsAt)}
												aria-label={`${offering.courseName} 열기`}
											>
												<strong>{offering.courseName}</strong><small class="course-professor"
													>{offering.professors.map((professor) => professor.name).join(', ') ||
														'교수 미정'}</small
												>
												{#if meeting.room}<small class="course-room">{meeting.room}</small>{/if}
											</button>
											{#if selected}
												<form
													class="course-block-remove"
													method="POST"
													action="?/removeItem"
													use:enhance={pendingEnhance}
												>
													<input type="hidden" name="timetableId" value={selected.id} /><input
														type="hidden"
														name="offeringId"
														value={offering.id}
													/><button
														disabled={busy}
														aria-label={`${offering.courseName} 시간표에서 제거`}
														title={`${offering.courseName} 제거`}><X size="0.68rem" /></button
													>
												</form>
											{/if}
										</article>
									{/each}
								</div>
							{/each}
						</div>
					</div>
					{#if selected}
						<UnscheduledCourseLane
							offerings={hiddenSelectedOfferings}
							timetableId={selected.id}
							{busy}
							{pendingEnhance}
							onopen={openUnscheduledBrowser}
							{courseColor}
						/>
					{/if}
				</section>

				{#if actualSelected && data.actualSchedule.unscheduledCompletions.length}
					<section class="module unscheduled-records">
						<div class="unscheduled-heading">
							<div>
								<h3>시간표에 표시되지 않는 수강 과목</h3>
								<p>수강 이력에서 수정하거나 삭제할 수 있습니다.</p>
							</div>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- hash is appended to a resolved route -->
							<a href={resolve('/academic') + '#course-history'}>수강 이력 관리</a>
						</div>
						<ul>
							{#each data.actualSchedule.unscheduledCompletions as completion (completion.id)}
								<li>
									<span>
										<b>{completion.courseName}</b>
										<small>{completion.courseCode}</small>
									</span>
									<span>분반 미상</span>
								</li>
							{/each}
						</ul>
					</section>
				{/if}
			</div>

			{#if selected && searchFilter}
				{#key searchSession}
					<CourseSearchPanel
						offerings={data.offerings}
						timetable={selected}
						offeringRestrictions={data.offeringRestrictions}
						offeringNotices={data.offeringNotices}
						filter={searchFilter}
						{busy}
						{pendingEnhance}
						onclose={closeCourseBrowser}
						onclearfilter={clearCourseSearchFilter}
						{courseColor}
						{scheduleText}
					/>
				{/key}
			{/if}
		</div>

		{#if progress}
			<details class="module degree-preview">
				<summary>
					<span class="degree-icon"><GraduationCap size="1rem" /></span>
					<span class="degree-summary-copy">
						<b>{actualSelected ? '현재 졸업요건' : '이 시간표 반영 시'}</b>
						<small
							>{degreeTotalPercent >= 100
								? '전체 졸업학점 충족'
								: `${Math.max(0, progress.required.total - progress.earned.total)}학점 남음`}</small
						>
					</span>
					<span class="degree-summary-progress" class:complete={degreeTotalPercent >= 100}>
						<span
							><b>{progress.earned.total}</b> / {progress.required
								.total}학점{#if degreeTotalDelta > 0}<em>+{degreeTotalDelta}학점</em>{/if}</span
						>
						<i>
							<b class="baseline" style={`width: ${degreeTotalBaselinePercent}%`}></b>
							{#if degreeTotalDelta > 0}<b
									class="added"
									style={`left: ${degreeTotalBaselinePercent}%; width: ${degreeTotalPercent - degreeTotalBaselinePercent}%`}
								></b>{/if}
						</i>
					</span>
					<span class="disclosure-icon"><ChevronDown size="0.9rem" /></span>
				</summary>
				<div class="degree-body">
					<section class="degree-section">
						<h3>분류별 학점</h3>
						<div class="degree-category-grid">
							{#each degreeCategoryProgress as item (item.key)}
								{@const complete = item.value >= item.required}
								<div class:complete>
									<span
										><b>{item.key}</b>{#if complete}<Check size="0.7rem" />{/if}</span
									>
									<small
										>{Math.min(item.value, item.required)}/{item.required}{#if item.delta > 0}<em
												>+{item.delta}</em
											>{/if}</small
									>
									<i>
										<b
											class="baseline"
											style={`width: ${requirementPercent(item.baseline, item.required)}%`}
										></b>
										{#if item.delta > 0}<b
												class="added"
												style={`left: ${requirementPercent(item.baseline, item.required)}%; width: ${requirementPercent(item.value, item.required) - requirementPercent(item.baseline, item.required)}%`}
											></b>{/if}
									</i>
								</div>
							{/each}
						</div>
					</section>
					<section class="degree-section">
						<h3>세부 요건</h3>
						<div class="degree-detail-grid">
							{#each degreeDetailProgress as item (item.key)}
								{@const complete = item.value >= item.required}
								{@const delta = Math.max(0, item.value - item.baseline)}
								<div class:complete>
									<span>
										<b>{item.label}</b>
										{#if complete}<Check size="0.7rem" aria-label="충족" />{/if}
									</span>
									<div class="degree-detail-value">
										{#if delta > 0}<em>+{delta} {item.unit}</em>{/if}
										<small>{item.value}/{item.required} {item.unit}</small>
									</div>
								</div>
							{/each}
						</div>
					</section>
				</div>
			</details>
		{:else}
			<p class="degree-note">
				이수·졸업에서 학사정보를 설정하면 졸업요건을 함께 확인할 수 있습니다.
			</p>
		{/if}

		<section class="module competition-card">
			<div class="section-title">
				<Users size="1.05rem" />
				<div>
					<h2>수강 희망 경쟁률</h2>
					<p>확정된 시간표에 담긴 강의만 표시됩니다.</p>
				</div>
			</div>
			{#if !data.competition.confirmed}
				<div class="competition-empty">
					<Clock size="1.1rem" /><span
						>시간표 하나를 확정하면 해당 강의의 경쟁률을 확인할 수 있습니다.</span
					>
				</div>
			{:else if !data.competition.items.length}
				<div class="competition-empty"><span>확정 시간표에 등록된 강의가 없습니다.</span></div>
			{:else}
				<p class="competition-slot">확정 시간표 · {data.competition.confirmedTimetableName}</p>
				<div class="competition-list">
					{#each data.competition.items as item (item.offering.id)}
						<div>
							<span
								><b>{item.offering.courseName}</b><small
									>{item.offering.courseId} · {item.offering.section}분반</small
								></span
							><span><b>{item.applicants}명</b><small>희망</small></span><span
								><b>{item.offering.capacity === null ? '–' : `${item.offering.capacity}명`}</b
								><small>정원</small></span
							><strong
								>{item.offering.capacity
									? `${(item.applicants / item.offering.capacity).toFixed(2)} : 1`
									: '–'}</strong
							>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{:else}
		<div class="empty-timetable">
			<div><Plus size="1.4rem" /></div>
			<h2>첫 시간표를 만들어 보세요</h2>
			<p>시간표마다 다른 강의를 담아 비교한 뒤 하나를 확정할 수 있습니다.</p>
		</div>
	{/if}
</section>

<style lang="scss">
	.timetable-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}
	.timetable-page[aria-busy='true'] {
		cursor: progress;
	}
	.timetable-page[aria-busy='true'] :is(button, input, select, summary) {
		opacity: 0.55;
		cursor: progress;
		pointer-events: none;
	}
	.planner-controls,
	.term-picker,
	.slot-toolbar,
	.slot-title,
	.slot-title form,
	.slot-stats,
	.slot-actions,
	.slot-utilities,
	.slot-actions button,
	.confirmed-badge,
	.actual-badge,
	.degree-preview summary,
	.section-title,
	.competition-empty {
		display: flex;
		align-items: center;
	}
	.section-title p {
		margin: 0;
		color: var(--gray-text);
		font-size: 0.8rem;
	}
	.term-picker {
		gap: 0.4rem;
	}
	.planner-controls {
		gap: 0.65rem;
		border-radius: 0.75rem;
		padding: 0.5rem 0.55rem;
		min-width: 0;
	}
	.term-picker {
		flex: 0 0 auto;
		border-right: var(--divider-border-width) solid var(--gray-border);
		padding-right: 0.65rem;
	}
	.term-picker input {
		width: 5.2rem;
	}
	.term-picker input,
	.term-picker select {
		border-color: transparent;
		background: var(--white);
	}
	.term-submit {
		display: grid;
		place-items: center;
		border-color: var(--secondary);
		border-radius: 50%;
		background: var(--secondary);
		padding: 0;
		width: 1.9rem;
		height: 1.9rem;
		color: white;

		&:hover:not(:disabled) {
			background: var(--secondary-strong-hover);
		}
	}
	.confirm-button {
		gap: 0.25rem;
		border-color: var(--secondary);
		background: var(--secondary);
		padding: 0.32rem 0.55rem;
		color: white;
		font-weight: 650;
		font-size: 0.68rem;

		&:hover:not(:disabled) {
			background: var(--secondary-strong-hover);
		}
	}
	.schedule-toolbar {
		display: flex;
		justify-content: flex-end;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		background: var(--white);
		padding: 0.4rem 0.5rem;
	}
	.schedule-toolbar button {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		border-color: color-mix(in srgb, var(--secondary) 36%, var(--gray-border));
		background: var(--white);
		padding: 0.32rem 0.52rem;
		color: var(--secondary);
		font-weight: 650;
		font-size: 0.66rem;
	}
	.schedule-toolbar button:hover:not(:disabled),
	.schedule-toolbar button:focus-visible {
		outline: 0;
		background: color-mix(in srgb, var(--secondary) 7%, var(--white));
	}
	.unconfirm-button {
		gap: 0.25rem;
		border-color: var(--error-text);
		background: var(--error-text);
		padding: 0.32rem 0.55rem;
		color: var(--white);
		font-size: 0.68rem;

		&:hover:not(:disabled) {
			background: var(--error-strong-hover);
		}
	}
	.slot-tabs {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 0.3rem;
		min-width: 0;
		overflow-x: auto;
	}
	.slot-button,
	.create-slot button {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.5rem;
		background: var(--white);
		padding: 0.42rem 0.62rem;
		color: var(--gray-text);
		font-size: 0.74rem;
		white-space: nowrap;
	}
	.slot-button.active {
		border-color: color-mix(in srgb, var(--secondary) 35%, var(--gray-border));
		background: color-mix(in srgb, var(--secondary) 7%, white);
		color: var(--secondary);
	}
	.actual-slot {
		color: var(--success-text);
	}
	.confirmed-marker {
		color: var(--success-text);
	}
	.create-slot {
		flex: 0 0 auto;
	}
	.create-slot button {
		justify-content: center;
		border-style: dashed;
		background: transparent;
		padding: 0;
		width: 2rem;
		height: 2rem;
		color: var(--secondary);
	}
	.slot-toolbar {
		justify-content: space-between;
		gap: 0.8rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.75rem;
		background: var(--white);
		padding: 0.65rem;
	}
	.slot-title {
		flex: 1;
		gap: 0.5rem;
		min-width: 13rem;
	}
	.slot-title form {
		flex: 1;
		flex-wrap: wrap;
		gap: 0.3rem;
	}
	.slot-title input {
		min-width: 7rem;
		max-width: 13rem;
	}
	.rename-error {
		flex-basis: 100%;
		margin: 0;
		color: var(--error-text);
		font-size: 0.7rem;
	}
	.slot-title h2 {
		margin: 0;
		font-size: 0.92rem;
	}
	.edit-name {
		border: 0;
		background: transparent;
		padding: 0.25rem;
		color: var(--gray-text);
	}
	.confirmed-badge,
	.actual-badge {
		flex-shrink: 0;
		gap: 0.2rem;
		border-radius: 999px;
		background: var(--success-bg);
		padding: 0.25rem 0.45rem;
		color: var(--success-text);
		font-weight: 600;
		font-size: 0.64rem;
	}
	.actual-toolbar {
		justify-content: space-between;
	}
	.slot-stats {
		gap: 0.65rem;
		color: var(--gray-text);
		font-size: 0.7rem;
		white-space: nowrap;
	}
	.slot-stats span + span {
		border-left: var(--divider-border-width) solid var(--gray-border);
		padding-left: 0.65rem;
	}
	.slot-stats b {
		margin-right: 0.1rem;
		color: var(--text);
		font-size: 0.88rem;
	}
	.slot-actions {
		gap: 0.3rem;
	}
	.slot-utilities {
		gap: 0.2rem;
		border-left: var(--divider-border-width) solid var(--gray-border);
		padding-left: 0.3rem;
	}
	.slot-actions button {
		gap: 0.25rem;
	}
	.icon-button {
		display: grid !important;
		place-items: center;
		padding: 0;
		width: 2rem;
		height: 2rem;
	}
	.danger-button {
		border-color: var(--error-text);
		background: var(--error-text);
		color: var(--white);

		&:hover:not(:disabled) {
			background: var(--error-strong-hover);
		}
	}
	.planner-workspace {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: start;
		gap: 0.8rem;
	}
	.planner-workspace.search-open {
		grid-template-columns: minmax(0, 1fr) minmax(19rem, 25rem);
	}
	.planner-main {
		display: grid;
		gap: 0.8rem;
		min-width: 0;
	}
	.schedule-panel,
	.degree-preview,
	.competition-card {
		border-radius: 0.8rem;
		overflow: hidden;
	}
	.schedule-panel,
	.degree-preview {
		padding: 0;
	}
	.schedule-scroll {
		overflow: hidden;
	}
	.schedule-onboarding {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		background: color-mix(in srgb, var(--secondary) 5%, var(--white));
		padding: 0.55rem 0.7rem;
	}
	.onboarding-icon {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		border-radius: 50%;
		background: color-mix(in srgb, var(--secondary) 10%, white);
		width: 1.8rem;
		height: 1.8rem;
		color: var(--secondary);
	}
	.schedule-onboarding > span:nth-child(2) {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}
	.schedule-onboarding strong {
		font-size: 0.73rem;
	}
	.schedule-onboarding small {
		color: var(--gray-text);
		font-size: 0.62rem;
	}
	.schedule-onboarding button {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		gap: 0.25rem;
		margin-left: auto;
		border-color: color-mix(in srgb, var(--secondary) 36%, var(--gray-border));
		background: var(--white);
		padding: 0.32rem 0.52rem;
		color: var(--secondary);
		font-weight: 650;
		font-size: 0.66rem;
	}
	.schedule-grid {
		display: grid;
		grid-template-columns: clamp(2.7rem, 6vw, 3.2rem) repeat(5, minmax(0, 1fr));
		width: 100%;
	}
	.corner,
	.day-header {
		position: sticky;
		top: 0;
		z-index: 5;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		background: var(--gray-bg);
		padding: 0.55rem;
		color: var(--gray-text);
		font-weight: 600;
		font-size: 0.72rem;
		text-align: center;
	}
	.time-axis {
		position: relative;
		border-right: var(--divider-border-width) solid var(--gray-border);
	}
	.time-axis span {
		position: absolute;
		right: 0.45rem;
		transform: translateY(-0.45em);
		color: var(--gray-text);
		font-size: 0.58rem;
	}
	.day-lane {
		position: relative;
		border-right: var(--divider-border-width) solid var(--gray-border);
	}
	.day-lane:last-child {
		border-right: 0;
	}
	.schedule-guide {
		position: absolute;
		right: 0;
		left: 0;
		z-index: 0;
		border-top: var(--divider-border-width) solid
			color-mix(in srgb, var(--gray-border) 75%, transparent);
		pointer-events: none;
	}
	button.grid-slot {
		display: grid;
		position: absolute;
		right: 0.12rem;
		left: 0.12rem;
		place-items: center;
		z-index: 1;
		cursor: cell;
		border: 0;
		border-radius: 0.28rem;
		background-image: none;
		background-color: var(--white);
		padding: 0;
		color: color-mix(in srgb, var(--gray-text) 55%, transparent);
	}
	button.grid-slot:hover:not(:disabled),
	button.grid-slot:focus-visible {
		outline: 0;
		background-color: color-mix(in srgb, var(--secondary) 8%, var(--white));
		color: var(--secondary);
	}
	.grid-slot:focus-visible {
		box-shadow: inset 0 0 0 var(--control-border-width) var(--secondary);
	}
	.course-block {
		position: absolute;
		right: 0.1rem;
		left: 0.1rem;
		z-index: 2;
		border: 0;
		border-top: 0.18rem solid var(--course-color);
		border-radius: 0 0 0.34rem 0.34rem;
		background: color-mix(in srgb, var(--course-color) 11%, var(--white));
		padding: 0;
		overflow: hidden;
		color: var(--text);
	}
	.course-block-copy {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: stretch;
		border: 0;
		border-radius: 0;
		background: transparent;
		padding: 0.22rem 1rem 0.22rem 0.32rem;
		width: 100%;
		min-width: 0;
		height: 100%;
		color: inherit;
		text-align: left;
	}
	.course-block-copy:not([aria-disabled='true']) {
		cursor: pointer;
	}
	.course-block-copy[aria-disabled='true'] {
		pointer-events: none;
	}
	.course-block-copy:hover:not([aria-disabled='true']),
	.course-block-copy:focus-visible {
		outline: 0;
		background: color-mix(in srgb, var(--course-color) 6%, transparent);
	}
	.course-block strong {
		overflow: hidden;
		font-weight: 700;
		font-size: clamp(0.62rem, 0.85vw, 0.72rem);
		line-height: 1.25;
		letter-spacing: -0.015em;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.course-block small {
		overflow: hidden;
		font-size: clamp(0.5rem, 0.68vw, 0.58rem);
		line-height: 1.3;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.course-professor {
		color: color-mix(in srgb, var(--text) 74%, var(--gray-text));
	}
	.course-room {
		color: var(--gray-text);
	}
	.course-block-remove {
		position: absolute;
		top: 0.14rem;
		right: 0.12rem;
		z-index: 3;
	}
	.course-block-remove button {
		display: grid;
		place-items: center;
		opacity: 0.55;
		cursor: pointer;
		border: 0;
		border-radius: 0.2rem;
		background: transparent;
		padding: 0;
		width: 0.95rem;
		height: 0.95rem;
		color: var(--gray-text);
	}
	.course-block-remove button:hover,
	.course-block-remove button:focus-visible {
		opacity: 1;
		outline: 0;
		background: var(--error-bg);
		color: var(--error-text);
	}
	.unscheduled-records {
		padding: 0.8rem;
	}
	.unscheduled-records h3 {
		margin: 0;
		font-size: 0.82rem;
	}
	.unscheduled-heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}
	.unscheduled-heading p {
		margin: 0.08rem 0 0;
		color: var(--gray-text);
		font-size: 0.67rem;
	}
	.unscheduled-heading a {
		flex: 0 0 auto;
		color: var(--secondary);
		font-weight: 600;
		font-size: 0.68rem;
	}
	.unscheduled-records ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: 0.35rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.unscheduled-records li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		border: var(--divider-border-width) solid var(--gray-border);
		border-radius: 0.45rem;
		padding: 0.45rem 0.55rem;
	}
	.unscheduled-records li > span:first-child {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.unscheduled-records b {
		font-size: 0.74rem;
	}
	.unscheduled-records small {
		color: var(--gray-text);
		font-size: 0.62rem;
	}
	.unscheduled-records li > span:last-child {
		flex: 0 0 auto;
		color: var(--gray-text);
		font-size: 0.62rem;
	}
	.disclosure-icon {
		display: grid !important;
		flex: 0 0 auto;
		place-items: center;
		transition: transform 0.18s ease;
		border: 0;
		background: transparent;
		padding: 0;
		color: var(--gray-text);
	}
	.disclosure-icon:hover {
		color: inherit;
	}
	details[open] > summary .disclosure-icon {
		transform: rotate(180deg);
	}
	.empty-timetable {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: var(--gray-text);
		text-align: center;
	}
	.degree-preview summary {
		display: grid;
		grid-template-columns: auto minmax(8rem, 1fr) minmax(10rem, 16rem) auto;
		align-items: center;
		gap: 0.65rem;
		cursor: pointer;
		padding: 0.75rem 0.85rem;
		list-style: none;
	}
	.degree-preview summary::-webkit-details-marker {
		display: none;
	}
	.degree-icon {
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: color-mix(in srgb, var(--secondary) 9%, white);
		width: 2rem;
		height: 2rem;
		color: var(--secondary);
	}
	.degree-icon :global(svg) {
		color: var(--secondary);
	}
	.degree-summary-copy {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.degree-preview summary .disclosure-icon {
		margin-left: 0;
	}
	.degree-summary-copy > b {
		font-size: 0.8rem;
	}
	.degree-summary-copy small {
		color: var(--gray-text);
		font-weight: 400;
		font-size: 0.63rem;
	}
	.degree-summary-progress {
		display: flex;
		flex-direction: column;
		gap: 0.22rem;
	}
	.degree-summary-progress > span {
		align-self: flex-end;
		color: var(--gray-text);
		font-size: 0.62rem;
	}
	.degree-summary-progress > span b {
		color: var(--text);
		font-size: 0.75rem;
	}
	.degree-summary-progress em,
	.degree-category-grid em,
	.degree-detail-value em {
		border-radius: 999px;
		background: var(--secondary-bg);
		padding: 0.08rem 0.28rem;
		color: var(--secondary);
		font-style: normal;
		font-weight: 700;
		font-size: 0.55rem;
	}
	.degree-summary-progress em {
		margin-left: 0.3rem;
	}
	.degree-category-grid em {
		margin-left: 0.2rem;
	}
	.degree-summary-progress > i,
	.degree-category-grid > div > i {
		display: block;
		position: relative;
		border-radius: 999px;
		background: var(--gray-bg);
		height: 0.35rem;
		overflow: hidden;
	}
	.degree-summary-progress > i > b,
	.degree-category-grid > div > i > b {
		position: absolute;
		top: 0;
		bottom: 0;
		border-radius: inherit;
	}
	.degree-summary-progress > i > .baseline,
	.degree-category-grid > div > i > .baseline {
		left: 0;
		background: color-mix(in srgb, var(--secondary) 42%, var(--gray-border));
	}
	.degree-summary-progress > i > .added,
	.degree-category-grid > div > i > .added {
		background: var(--secondary);
	}
	.degree-summary-progress.complete > span,
	.degree-summary-progress.complete > span b {
		color: var(--success-text);
	}
	.degree-summary-progress.complete > i > .baseline {
		background: color-mix(in srgb, var(--success-text) 42%, var(--gray-border));
	}
	.degree-summary-progress.complete > i > .added {
		background: var(--success-text);
	}
	.degree-body {
		display: grid;
		gap: 0.8rem;
		border-top: var(--divider-border-width) solid var(--gray-border);
		background: color-mix(in srgb, var(--gray-bg) 45%, white);
		padding: 0.8rem;
	}
	.degree-section h3 {
		margin: 0 0 0.38rem;
		color: var(--gray-text);
		font-size: 0.64rem;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}
	.degree-category-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(6.2rem, 1fr));
		gap: 0.35rem;
	}
	.degree-category-grid > div {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 0.28rem 0.4rem;
		border: var(--divider-border-width) solid var(--gray-border);
		border-radius: 0.45rem;
		background: var(--white);
		padding: 0.42rem 0.48rem;
	}
	.degree-category-grid > div > span {
		display: flex;
		align-items: center;
		gap: 0.18rem;
		font-size: 0.66rem;
	}
	.degree-category-grid > div > small {
		color: var(--gray-text);
		font-size: 0.58rem;
	}
	.degree-category-grid > div > i {
		grid-column: 1 / -1;
	}
	.degree-category-grid > div.complete {
		border-color: color-mix(in srgb, var(--success-text) 23%, var(--gray-border));
	}
	.degree-category-grid > div.complete > span,
	.degree-category-grid > div.complete > small {
		color: var(--success-text);
	}
	.degree-category-grid > div.complete > i > .baseline {
		background: color-mix(in srgb, var(--success-text) 42%, var(--gray-border));
	}
	.degree-category-grid > div.complete > i > .added {
		background: var(--success-text);
	}
	.degree-detail-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: 0.35rem;
	}
	.degree-detail-grid > div {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.4rem;
		border-left: 2px solid var(--gray-border);
		background: var(--white);
		padding: 0.38rem 0.48rem;
	}
	.degree-detail-grid > div > span {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		min-width: 0;
		font-size: 0.63rem;
	}
	.degree-detail-value {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		gap: 0.25rem;
	}
	.degree-detail-value small {
		flex: 0 0 auto;
		color: var(--gray-text);
		font-size: 0.58rem;
	}
	.degree-detail-grid > div.complete {
		border-left-color: var(--success-text);
	}
	.degree-detail-grid > div.complete > span,
	.degree-detail-grid > div.complete .degree-detail-value small {
		color: var(--success-text);
	}
	.degree-note {
		color: var(--gray-text);
		font-size: 0.68rem;
	}
	.degree-note {
		margin: 0;
	}
	.competition-card {
		padding: 0.85rem;
	}
	.section-title {
		gap: 0.5rem;
	}
	.section-title > :global(svg) {
		color: var(--secondary);
	}
	.section-title h2 {
		margin: 0;
		font-size: 0.92rem;
	}
	.section-title p {
		font-size: 0.68rem;
	}
	.competition-empty {
		justify-content: center;
		gap: 0.4rem;
		margin-top: 0.65rem;
		border-radius: 0.5rem;
		background: var(--gray-bg);
		padding: 0.8rem;
		color: var(--gray-text);
		font-size: 0.72rem;
	}
	.competition-slot {
		margin: 0.45rem 0;
		color: var(--gray-text);
		font-size: 0.67rem;
	}
	.competition-list {
		border-top: var(--divider-border-width) solid var(--gray-border);
	}
	.competition-list > div {
		display: grid;
		grid-template-columns: 1fr 4rem 4rem 5rem;
		align-items: center;
		gap: 0.5rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		padding: 0.55rem 0;
	}
	.competition-list span {
		display: flex;
		flex-direction: column;
	}
	.competition-list b {
		font-size: 0.72rem;
	}
	.competition-list small {
		color: var(--gray-text);
		font-size: 0.58rem;
	}
	.competition-list > div > strong {
		color: var(--secondary);
		font-size: 0.78rem;
		text-align: right;
	}
	.empty-timetable {
		gap: 0.4rem;
		border: var(--control-border-width) dashed var(--gray-border);
		border-radius: 0.8rem;
		padding: 3.2rem 1rem;
	}
	.empty-timetable > div {
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: color-mix(in srgb, var(--secondary) 9%, white);
		width: 3rem;
		height: 3rem;
		color: var(--secondary);
	}
	.empty-timetable h2,
	.empty-timetable p {
		margin: 0;
	}
	.empty-timetable h2 {
		color: var(--text);
		font-size: 1rem;
	}
	.empty-timetable p {
		font-size: 0.76rem;
	}
	@media (max-width: 1100px) {
		.planner-workspace.search-open {
			grid-template-columns: minmax(0, 1fr) minmax(18rem, 21rem);
		}
	}
	@media (max-width: 900px) {
		.planner-workspace.search-open {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 760px) {
		.planner-controls {
			flex-direction: column;
			align-items: stretch;
		}
		.slot-toolbar {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: center;
			gap: 0.55rem 0.7rem;
			padding: 0.6rem;
		}
		.term-picker {
			display: grid;
			grid-template-columns: 1fr 1fr auto;
			border-right: 0;
			border-bottom: var(--divider-border-width) solid var(--gray-border);
			padding-right: 0;
			padding-bottom: 0.5rem;
		}
		.term-picker input {
			width: 100%;
		}
		.slot-tabs {
			width: 100%;
		}
		.corner,
		.day-header {
			padding-inline: 0.2rem;
		}
		.slot-title {
			grid-row: 1;
			grid-column: 1 / -1;
			flex-direction: row;
			align-items: center;
			min-width: 0;
		}
		.slot-title h2 {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.slot-title form {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto auto;
			width: 100%;
		}
		.rename-error {
			grid-column: 1 / -1;
		}
		.slot-title input {
			flex: 1;
			min-width: 0;
			max-width: none;
		}
		.slot-stats {
			grid-row: 2;
			grid-column: 1;
			justify-content: flex-start;
			gap: 0.48rem;
			overflow-x: auto;
		}
		.slot-stats span + span {
			padding-left: 0.48rem;
		}
		.slot-actions {
			grid-row: 2;
			grid-column: 2;
			justify-content: flex-end;
		}
		.actual-toolbar .slot-stats {
			grid-column: 1 / -1;
		}
		.confirm-button {
			padding-inline: 0.7rem;
			font-weight: 650;
		}
		.degree-preview summary {
			grid-template-columns: auto minmax(0, 1fr) auto;
		}
		.degree-icon {
			grid-row: 1;
			grid-column: 1;
		}
		.degree-summary-copy {
			grid-row: 1;
			grid-column: 2;
		}
		.degree-preview summary .disclosure-icon {
			grid-row: 1;
			grid-column: 3;
		}
		.degree-summary-progress {
			grid-row: 2;
			grid-column: 2 / 4;
		}
		.schedule-onboarding {
			flex-wrap: wrap;
			align-items: flex-start;
		}
		.competition-list > div {
			grid-template-columns: 1fr 3rem 3rem 4rem;
		}
	}
	@media (max-width: 480px) {
		.slot-stats {
			grid-row: 2;
			grid-column: 1 / -1;
		}
		.slot-actions {
			grid-row: 3;
			grid-column: 1 / -1;
			justify-content: space-between;
		}
		.slot-actions > form {
			flex: 1;
		}
		.slot-actions > form > button {
			justify-content: center;
			width: 100%;
		}
	}
</style>
