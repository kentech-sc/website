<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';

	import CompetitionCard from './_components/CompetitionCard.svelte';
	import DegreePreview from './_components/DegreePreview.svelte';
	import ScheduleWorkspace from './_components/ScheduleWorkspace.svelte';
	import { TimetablePageState } from './_components/timetable-page-state.svelte.js';
	import TimetableSelector from './_components/TimetableSelector.svelte';
	import TimetableToolbar from './_components/TimetableToolbar.svelte';

	import AcademicHeader from '$components/AcademicHeader.svelte';

	let { data } = $props();
	const timetable = new TimetablePageState(() => data);

	const selected = $derived(timetable.selected);
	const actualSelected = $derived(timetable.actualSelected);
	const displayOfferings = $derived(timetable.displayOfferings);
	const archivedOfferings = $derived(timetable.archivedOfferings);
	const activeDisplayOfferings = $derived(timetable.activeDisplayOfferings);
	const hiddenSelectedOfferings = $derived(timetable.hiddenSelectedOfferings);
	const busy = $derived(timetable.busy);
	const progress = $derived(timetable.progress);

	$effect(timetable.ensureValidSelection);
</script>

<section class="timetable-page" aria-busy={busy}>
	<AcademicHeader
		title="시간표"
		description="여러 시간표를 비교하고 하나를 확정하세요."
		canManageCatalog={data.canManageCatalog}
	/>

	<TimetableSelector
		{data}
		selectedId={timetable.selectedId}
		actualId={timetable.actualId}
		{actualSelected}
		onSelect={timetable.selectTimetable}
		pendingEnhance={timetable.pendingEnhance}
	/>

	{#if actualSelected || selected}
		<TimetableToolbar
			{actualSelected}
			{selected}
			courseCount={actualSelected
				? data.actualSchedule.completions.length
				: activeDisplayOfferings.length}
			totalCredits={timetable.totalCredits}
			totalHours={timetable.totalHours}
			archivedCourseCount={archivedOfferings.length}
			savingImage={timetable.savingImage}
			bind:editingName={timetable.editingName}
			renameError={timetable.renameError}
			onCancelRename={timetable.cancelRename}
			onDownload={timetable.downloadSelectedSchedule}
			pendingEnhance={timetable.pendingEnhance}
			renameEnhance={timetable.renameEnhance}
			deleteEnhance={timetable.deleteEnhance}
		/>

		<ScheduleWorkspace
			{data}
			{selected}
			{actualSelected}
			{displayOfferings}
			{archivedOfferings}
			{hiddenSelectedOfferings}
			{busy}
			savingImage={timetable.savingImage}
			searchFilter={timetable.searchFilter}
			searchSession={timetable.searchSession}
			bind:schedulePanel={timetable.schedulePanel}
			weekdays={timetable.weekdays}
			openCourseBrowser={timetable.openCourseBrowser}
			openSlotPicker={timetable.openSlotPicker}
			openReplacementPicker={timetable.openReplacementPicker}
			openUnscheduledBrowser={timetable.openUnscheduledBrowser}
			closeCourseBrowser={timetable.closeCourseBrowser}
			clearCourseSearchFilter={timetable.clearCourseSearchFilter}
			pendingEnhance={timetable.pendingEnhance}
			replaceEnhance={timetable.replaceEnhance}
			removeOfferingEnhance={timetable.removeOfferingEnhance}
		/>

		<DegreePreview {progress} baseline={data.degreeProgress} {actualSelected} />
		<CompetitionCard competition={data.competition} />
	{:else}
		<div class="empty-timetable">
			<div class="accent-icon"><Plus size="1.4rem" /></div>
			<h2>첫 시간표를 만들어 보세요</h2>
			<p>시간표마다 다른 강의를 담아 비교한 뒤 하나를 확정할 수 있습니다.</p>
		</div>
	{/if}
</section>

<style lang="scss">
	@use './timetable-page.scss';
</style>
