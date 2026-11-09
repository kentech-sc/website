<script lang="ts" module>
	export interface SlotCellContext {
		index: number;
		dayIndex: number;
		slot: number;
		/** 정시에 시작하는 칸. 위쪽 선을 진하게 그린다. */
		isHourStart: boolean;
	}
</script>

<script lang="ts">
	import type { MeetupMode } from '$lib/types/meetup.type.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import {
		MEETUP_SLOT_MINUTES,
		formatMeetupDay,
		formatMinute,
		getSlotIndex,
		getSlotsPerDay
	} from '$lib/shared/meetup.js';

	let {
		mode,
		days,
		startMinute,
		endMinute,
		isEditable = false,
		cell,
		...rest
	}: {
		mode: MeetupMode;
		days: string[];
		startMinute: number;
		endMinute: number;
		/** 드래그로 칠하는 표. 터치 스크롤 대신 칠하기가 먼저다. */
		isEditable?: boolean;
		cell: Snippet<[SlotCellContext]>;
	} & HTMLAttributes<HTMLDivElement> = $props();

	const slotsPerDay = $derived(getSlotsPerDay(startMinute, endMinute));
	const slots = $derived(Array.from({ length: slotsPerDay }, (_, slot) => slot));
</script>

<div class="slot-table" class:is-editable={isEditable} style:--day-count={days.length} {...rest}>
	<span></span>
	{#each days as day (day)}
		<strong>{formatMeetupDay(mode, day)}</strong>
	{/each}

	{#each slots as slot (slot)}
		{@const minute = startMinute + slot * MEETUP_SLOT_MINUTES}
		{@const isHourStart = minute % 60 === 0}
		<time>{isHourStart ? formatMinute(minute) : ''}</time>
		{#each days as day, dayIndex (day)}
			{@render cell({
				index: getSlotIndex({ day: dayIndex, slot }, slotsPerDay),
				dayIndex,
				slot,
				isHourStart
			})}
		{/each}
	{/each}
</div>

<style lang="scss">
	.slot-table {
		display: grid;
		grid-template-columns: 2.6rem repeat(var(--day-count), minmax(1.8rem, 1fr));
		grid-auto-rows: 0.8rem;
		overflow-x: auto;
		user-select: none;
	}

	.slot-table.is-editable {
		cursor: pointer;
		touch-action: none;
	}

	.slot-table > strong {
		grid-row: span 2;
		align-self: end;
		padding-bottom: 0.2rem;
		font-weight: 600;
		font-size: 0.7rem;
		text-align: center;
		white-space: nowrap;
	}

	.slot-table > span {
		grid-row: span 2;
	}

	.slot-table > time {
		padding-right: 0.4rem;
		color: var(--gray-text);
		font-size: 0.6rem;
		line-height: 0.8rem;
		text-align: end;
	}
</style>
