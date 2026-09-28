<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';

	import { COURSE_SLOTS, getFreeTimeRanges } from './course-search.js';
	import {
		courseColor,
		formatRoomName,
		formatScheduleTime,
		schedulePosition,
		scheduleHeight
	} from './schedule-display.js';

	import type { CourseSearchFilter, TimeBlock } from './course-search.js';
	import type { PageData } from '../$types.js';
	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';

	type Offering = PageData['offerings'][number];
	type Meeting = Offering['meetings'][number];

	let {
		selected,
		displayOfferings,
		allOfferings,
		savingImage,
		busy,
		searchFilter,
		changeReasons,
		conflictingOfferingIds,
		weekdays,
		onPickSlot,
		onPickReplacement,
		removeOfferingEnhance
	}: {
		selected: PageData['timetables'][number] | null;
		displayOfferings: Offering[];
		allOfferings: Offering[];
		savingImage: boolean;
		busy: boolean;
		searchFilter: CourseSearchFilter | null;
		changeReasons: Record<string, string | undefined>;
		conflictingOfferingIds: Set<string>;
		weekdays: string[];
		onPickSlot: (weekday: number, block: TimeBlock) => void;
		onPickReplacement: (offeringId: string, meeting: Meeting) => void;
		removeOfferingEnhance: SubmitFunction;
	} = $props();

	const scheduleGuides = [9, 11, 12, 14, 16, 18, 20, 21].map((hour) => hour * 60);
	const selectedMeetings = $derived(displayOfferings.flatMap((offering) => offering.meetings));
	const rangeMeetings = $derived(
		selected ? allOfferings.flatMap((offering) => offering.meetings) : selectedMeetings
	);
	const gridStartMinute = $derived(
		rangeMeetings.length
			? Math.min(
					9 * 60,
					Math.floor(Math.min(...rangeMeetings.map((meeting) => meeting.startMinute)) / 60) * 60
				)
			: 9 * 60
	);
	const selectedEndMinute = $derived(
		selectedMeetings.length
			? Math.ceil(Math.max(...selectedMeetings.map((meeting) => meeting.endMinute)) / 30) * 30
			: 21 * 60
	);
	const gridEndMinute = $derived(
		savingImage && selectedMeetings.length
			? Math.max(gridStartMinute + 60, selectedEndMinute)
			: Math.max(21 * 60, selectedEndMinute)
	);
	const timeLabels = $derived(
		Array.from(
			{ length: Math.floor((gridEndMinute - gridStartMinute) / 60) + 1 },
			(_, index) => gridStartMinute + index * 60
		)
	);
	const gridHeight = $derived(
		schedulePosition(gridEndMinute, gridStartMinute) +
			schedulePosition(gridStartMinute, gridStartMinute)
	);

	const meetingsForDay = (day: number) =>
		displayOfferings.flatMap((offering) =>
			offering.meetings
				.filter((meeting) => meeting.weekday === day)
				.map((meeting) => ({ offering, meeting }))
		);
	const meetingStyle = (category: string | null, startMinute: number, endMinute: number) => {
		const top = schedulePosition(startMinute, gridStartMinute);
		const height = Math.max(1.15, scheduleHeight(startMinute, endMinute));
		return `--course-color: ${courseColor(category)}; top: ${top}rem; height: ${height}rem`;
	};
	const freeSlotRanges = (weekday: number, block: TimeBlock) =>
		getFreeTimeRanges(weekday, block, selectedMeetings);
	const gridSlotStyle = (startMinute: number, endMinute: number) => {
		const inset = 0.08;
		return `top: ${schedulePosition(startMinute, gridStartMinute) + inset}rem; height: ${scheduleHeight(startMinute, endMinute) - inset * 2}rem`;
	};
	const guideStyle = (minute: number) => `top: ${schedulePosition(minute, gridStartMinute)}rem`;
</script>

<div class="schedule-scroll">
	<div class="schedule-grid">
		<div class="corner">시간</div>
		{#each weekdays as weekday (weekday)}<div class="day-header">{weekday}</div>{/each}
		<div class="time-axis" style={`height: ${gridHeight}rem`}>
			{#each timeLabels as minute (minute)}
				<span style={`top: ${schedulePosition(minute, gridStartMinute)}rem`}>
					{formatScheduleTime(minute)}
				</span>
			{/each}
		</div>

		{#each weekdays as weekday, day (weekday)}
			<div class="day-lane" style={`height: ${gridHeight}rem`}>
				{#each scheduleGuides.filter((minute) => minute <= gridEndMinute) as minute (minute)}
					<span class="schedule-guide" style={guideStyle(minute)} aria-hidden="true"></span>
				{/each}
				<!-- 수요일은 정규 강의가 열리지 않아 블록 버튼을 두지 않는다. -->
				{#if selected && day !== 2}
					{#each COURSE_SLOTS as slot (slot.startMinute)}
						{#each freeSlotRanges(day + 1, slot) as freeRange (`${freeRange.startMinute}-${freeRange.endMinute}`)}
							<button
								type="button"
								class="grid-slot"
								data-image-exclude
								style={gridSlotStyle(freeRange.startMinute, freeRange.endMinute)}
								disabled={busy}
								onclick={() => onPickSlot(day + 1, freeRange)}
								aria-label={`${weekday} ${formatScheduleTime(freeRange.startMinute)}에 강의 추가`}
								title={`${weekday} ${formatScheduleTime(freeRange.startMinute)}–${formatScheduleTime(freeRange.endMinute)} 강의 찾기`}
							>
								<Plus size="0.8rem" aria-hidden="true" />
							</button>
						{/each}
					{/each}
				{/if}

				{#each meetingsForDay(day + 1) as { offering, meeting } (`${offering.id}-${meeting.id}`)}
					<article
						class="course-block"
						class:is-cancelled={offering.archivedAt !== null}
						class:has-change={changeReasons[offering.id] !== undefined}
						class:has-conflict={conflictingOfferingIds.has(offering.id)}
						style={meetingStyle(offering.category, meeting.startMinute, meeting.endMinute)}
					>
						<button
							type="button"
							class="course-block-copy"
							class:is-selected={searchFilter?.kind === 'replace' &&
								searchFilter.sourceOfferingId === offering.id &&
								searchFilter.meetingId === meeting.id}
							disabled={!selected || busy || offering.archivedAt !== null}
							onclick={() => onPickReplacement(offering.id, meeting)}
							aria-label={`${offering.courseName} 선택`}
							title={selected ? `${offering.courseName} 교체하기` : offering.courseName}
						>
							{#if offering.archivedAt !== null}<span class="cancelled-badge">폐강</span>{/if}
							{#if offering.archivedAt === null && conflictingOfferingIds.has(offering.id)}
								<span class="change-badge is-conflict">시간 겹침</span>
							{:else if changeReasons[offering.id] === 'schedule_changed' || changeReasons[offering.id] === 'details_changed'}
								<span class="change-badge">정보 변경</span>
							{/if}
							<strong>{offering.courseName}</strong>
							<small class="course-professor">
								{offering.professors.map((professor) => professor.name).join(', ') || '교수 미정'}
							</small>
							{#if meeting.room}<small class="course-room">{formatRoomName(meeting.room)}</small
								>{/if}
							<small class="course-time">
								{formatScheduleTime(meeting.startMinute)}–{formatScheduleTime(meeting.endMinute)}
							</small>
						</button>
						{#if selected}
							<form
								class="course-block-remove"
								data-image-exclude
								method="POST"
								action="?/removeItem"
								use:enhance={removeOfferingEnhance}
							>
								<input type="hidden" name="timetableId" value={selected.id} />
								<input type="hidden" name="offeringId" value={offering.id} />
								<button
									disabled={busy}
									aria-label={`${offering.courseName} 시간표에서 제거`}
									title={`${offering.courseName} 제거`}
								>
									<X size="0.7rem" />
								</button>
							</form>
						{/if}
					</article>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@use './timetable-grid.scss';
</style>
