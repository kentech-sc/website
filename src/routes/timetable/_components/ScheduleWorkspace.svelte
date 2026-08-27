<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';

	import ActualUnscheduledCourses from './ActualUnscheduledCourses.svelte';
	import CourseSearchPanel from './CourseSearchPanel.svelte';
	import TimetableGrid from './TimetableGrid.svelte';
	import UnscheduledCourseLane from './UnscheduledCourseLane.svelte';

	import type { CourseSearchFilter, TimeBlock } from './course-search.js';
	import type { PageData } from '../$types.js';
	import type { SubmitFunction } from '@sveltejs/kit';

	type Offering = PageData['offerings'][number];
	type Meeting = Offering['meetings'][number];

	let {
		data,
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
		data: PageData;
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
						class="ui-button is-secondary is-compact schedule-search-action"
						type="button"
						data-image-exclude
						disabled={busy}
						onclick={openCourseBrowser}><Search size="0.8rem" />전체 강의 검색</button
					>
				</div>
			{:else if selected && !savingImage}
				<div class="schedule-toolbar">
					<button
						class="ui-button is-secondary is-compact"
						type="button"
						disabled={busy}
						onclick={openCourseBrowser}><Search size="0.8rem" />전체 강의 검색</button
					>
				</div>
			{/if}

			{#if selected && archivedOfferings.length}
				<div class="cancelled-notice" role="alert">
					<AlertTriangle size="0.9rem" aria-hidden="true" />
					<span
						><strong>폐강된 강의가 {archivedOfferings.length}개 있습니다.</strong> 시간표에서 제거해야
						다시 확정할 수 있습니다.</span
					>
				</div>
			{/if}

			<TimetableGrid
				{selected}
				{displayOfferings}
				allOfferings={data.offerings}
				{savingImage}
				{busy}
				{searchFilter}
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
			<ActualUnscheduledCourses completions={data.actualSchedule.unscheduledCompletions} />
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
				{replaceEnhance}
				{removeOfferingEnhance}
				onClose={closeCourseBrowser}
				onClearFilter={clearCourseSearchFilter}
			/>
		{/key}
	{/if}
</div>

<style lang="scss">
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
	.schedule-panel {
		border-radius: 0.8rem;
	}
	.schedule-toolbar {
		display: flex;
		justify-content: flex-end;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		background: var(--white);
		padding: 0.4rem 0.6rem;
	}
	.cancelled-notice,
	.schedule-onboarding {
		display: flex;
		align-items: center;
	}
	.cancelled-notice {
		gap: 0.4rem;
		border-bottom: var(--divider-border-width) solid
			color-mix(in srgb, var(--error-text) 25%, var(--gray-border));
		background: var(--error-bg);
		padding: 0.4rem 0.6rem;
		color: var(--error-text);
		font-size: 0.7rem;
	}
	.cancelled-notice span {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem 0.4rem;
	}
	.schedule-onboarding {
		gap: 0.6rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		background: color-mix(in srgb, var(--secondary) 5%, var(--white));
		padding: 0.6rem 0.8rem;
	}
	.onboarding-icon {
		flex: 0 0 auto;
		width: 1.8rem;
		height: 1.8rem;
	}
	.schedule-onboarding > span:nth-child(2) {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}
	.schedule-onboarding strong {
		font-size: 0.7rem;
	}
	.schedule-onboarding small {
		color: var(--gray-text);
		font-size: 0.6rem;
	}
	.schedule-onboarding .schedule-search-action {
		flex: 0 0 auto;
		margin-left: auto;
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
		.schedule-onboarding {
			flex-wrap: wrap;
			align-items: flex-start;
		}
	}
</style>
