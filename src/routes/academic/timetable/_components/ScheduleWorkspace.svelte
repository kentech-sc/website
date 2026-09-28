<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';

	import ActualUnscheduledCourses from './ActualUnscheduledCourses.svelte';
	import CourseSearchPanel from './CourseSearchPanel.svelte';
	import ScheduleNotices from './ScheduleNotices.svelte';
	import TimetableGrid from './TimetableGrid.svelte';
	import UnscheduledCourseLane from './UnscheduledCourseLane.svelte';

	import type { CourseSearchFilter, TimeBlock } from './course-search.js';
	import type { PageData } from '../$types.js';
	import type { SubmitFunction } from '@sveltejs/kit';

	type Offering = PageData['offerings'][number];
	type Meeting = Offering['meetings'][number];

	let {
		timetableConflicts,
		offerings,
		actualSchedule,
		offeringRestrictions,
		offeringNotices,

		selected,
		actualSelected,
		displayOfferings,
		archivedOfferings,
		hiddenSelectedOfferings,
		busy,
		savingImage,
		searchFilter,
		searchSession,
		schedulePanel = $bindable(),
		weekdays,
		openCourseBrowser,
		openSlotPicker,
		openReplacementPicker,
		openUnscheduledBrowser,
		closeCourseBrowser,
		clearCourseSearchFilter,
		pendingEnhance,
		replaceEnhance,
		removeOfferingEnhance
	}: {
		timetableConflicts: PageData['timetableConflicts'];
		offerings: PageData['offerings'];
		actualSchedule: PageData['actualSchedule'];
		offeringRestrictions: PageData['offeringRestrictions'];
		offeringNotices: PageData['offeringNotices'];
		selected: PageData['timetables'][number] | null;
		actualSelected: boolean;
		displayOfferings: Offering[];
		archivedOfferings: Offering[];
		hiddenSelectedOfferings: Offering[];
		busy: boolean;
		savingImage: boolean;
		searchFilter: CourseSearchFilter | null;
		searchSession: number;
		schedulePanel?: HTMLElement | null;
		weekdays: string[];
		openCourseBrowser: () => void;
		openSlotPicker: (weekday: number, block: TimeBlock) => void;
		openReplacementPicker: (offeringId: string, meeting: Meeting) => void;
		openUnscheduledBrowser: () => void;
		closeCourseBrowser: () => void;
		clearCourseSearchFilter: () => void;
		pendingEnhance: SubmitFunction;
		replaceEnhance: SubmitFunction;
		removeOfferingEnhance: SubmitFunction;
	} = $props();

	const conflicts = $derived(selected ? (timetableConflicts[selected.id] ?? []) : []);
	const conflictingOfferingIds = $derived(
		new Set(
			conflicts.flatMap(({ firstOfferingId, secondOfferingId }) => [
				firstOfferingId,
				secondOfferingId
			])
		)
	);
</script>

<div class="planner-workspace" class:search-open={searchFilter !== null}>
	<div class="planner-main">
		<section
			class="module is-flush schedule-panel"
			bind:this={schedulePanel}
			aria-label={actualSelected ? '실제 수강 시간표' : `${selected?.name ?? '시간표'} 시간표`}
		>
			{#if selected && displayOfferings.length === 0}
				<div class="schedule-onboarding">
					<span class="accent-icon onboarding-icon"><Plus size="0.9rem" aria-hidden="true" /></span>
					<span>
						<strong>빈 칸을 눌러 강의를 추가하세요</strong>
						<small>선택한 요일과 시간에 맞는 강의만 바로 보여드려요.</small>
					</span>
					<button
						class="ui-button is-compact is-secondary schedule-search-action"
						type="button"
						data-image-exclude
						disabled={busy}
						onclick={openCourseBrowser}><Search size="0.8rem" />전체 강의 검색</button
					>
				</div>
			{:else if selected && !savingImage}
				<div class="schedule-toolbar">
					<button
						class="ui-button is-compact is-secondary"
						type="button"
						disabled={busy}
						onclick={openCourseBrowser}><Search size="0.8rem" />전체 강의 검색</button
					>
				</div>
			{/if}

			<ScheduleNotices {selected} {archivedOfferings} {conflicts} {busy} {pendingEnhance} />

			<TimetableGrid
				{selected}
				{displayOfferings}
				allOfferings={offerings}
				{savingImage}
				{busy}
				{searchFilter}
				changeReasons={selected?.changeReasons ?? {}}
				{conflictingOfferingIds}
				{weekdays}
				onPickSlot={openSlotPicker}
				onPickReplacement={openReplacementPicker}
				{removeOfferingEnhance}
			/>

			{#if selected}
				<UnscheduledCourseLane
					offerings={hiddenSelectedOfferings}
					timetableId={selected.id}
					{busy}
					{pendingEnhance}
					onOpen={openUnscheduledBrowser}
					imageSaving={savingImage}
				/>
			{/if}
		</section>

		{#if actualSelected}
			<ActualUnscheduledCourses records={actualSchedule.unscheduledRecords} />
		{/if}
	</div>

	{#if selected && searchFilter}
		{#key searchSession}
			<CourseSearchPanel
				{offerings}
				timetable={selected}
				{offeringRestrictions}
				{offeringNotices}
				filter={searchFilter}
				{busy}
				{pendingEnhance}
				{replaceEnhance}
				{removeOfferingEnhance}
				onClose={closeCourseBrowser}
				onClearFilter={clearCourseSearchFilter}
			/>
		{/key}
	{/if}
</div>

<style lang="scss">
	@use './schedule-workspace.scss';
</style>
