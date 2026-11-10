<script lang="ts">
	import SlotTable from './SlotTable.svelte';

	import type { Meetup, MeetupResponse } from '$lib/types/meetup.type.js';

	import PanelHeader from '$components/PanelHeader.svelte';
	import {
		MEETUP_SLOT_MINUTES,
		countAvailability,
		findEveryoneSlots,
		formatMeetupDay,
		formatTimeRange,
		getSlotsPerDay,
		groupSlotRanges
	} from '$lib/shared/meetup.js';

	let { meetup, responses }: { meetup: Meetup; responses: MeetupResponse[] } = $props();

	/** 한 명이라도 되는 칸이 빈칸과 구분되도록 이 농도부터 시작한다. */
	const MIN_LEVEL = 0.2;

	const slotsPerDay = $derived(getSlotsPerDay(meetup.startMinute, meetup.endMinute));
	const counts = $derived(countAvailability(responses, meetup.days.length * slotsPerDay));
	const total = $derived(responses.length);
	const everyoneSlots = $derived(findEveryoneSlots(counts, total));
	const everyoneText = $derived(
		groupSlotRanges(everyoneSlots, meetup.startMinute, meetup.endMinute)
			.map(
				(range) =>
					`${formatMeetupDay(meetup.mode, meetup.days[range.dayIndex])} ${formatTimeRange(range.startMinute, range.endMinute)}`
			)
			.join(', ')
	);

	const getLevel = (count: number) => (count ? MIN_LEVEL + (1 - MIN_LEVEL) * (count / total) : 0);

	const POPUP_GAP_PX = 12;
	const POPUP_MARGIN_PX = 8;

	/** 가리키거나 누른 칸. 그 칸에 누가 되는지 팝업으로 보여준다. */
	let focused = $state<{ index: number; dayIndex: number; slot: number } | null>(null);
	let pointer = $state({ x: 0, y: 0 });
	/** 터치는 포인터 옆에 띄우면 손가락에 가려서 화면 아래에 고정한다. */
	let isTouch = $state(false);
	let popupWidth = $state(0);
	let popupHeight = $state(0);
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);

	/** 포인터 옆에 띄우고, 화면 끝에 닿으면 반대쪽으로 넘긴다. */
	const getPopupOffset = (at: number, size: number, viewport: number) => {
		const after = at + POPUP_GAP_PX;
		return Math.max(POPUP_MARGIN_PX, after + size > viewport ? at - POPUP_GAP_PX - size : after);
	};

	const readCell = (target: EventTarget | null) => {
		const element = (target as Element | null)?.closest<HTMLElement>('[data-index]');
		if (!element) return null;
		return {
			index: Number(element.dataset.index),
			dayIndex: Number(element.dataset.day),
			slot: Number(element.dataset.slot)
		};
	};

	const movePointer = (event: PointerEvent) => {
		if (event.pointerType === 'touch') return;
		isTouch = false;
		pointer = { x: event.clientX, y: event.clientY };
		const cell = readCell(event.target);
		if (cell?.index !== focused?.index) focused = cell;
	};

	const leaveTable = (event: PointerEvent) => {
		if (event.pointerType !== 'touch') focused = null;
	};

	// 터치는 손을 떼면 pointerleave 가 바로 오고 스크롤도 거쳐 가므로, 탭했을 때만 고른다.
	const tapCell = (event: MouseEvent) => {
		if (isTouch) focused = readCell(event.target);
	};

	const handleWindowPointerDown = (event: PointerEvent) => {
		isTouch = event.pointerType === 'touch';
		if (!readCell(event.target)) focused = null;
	};

	const focusedDetail = $derived.by(() => {
		if (!focused || !total) return null;
		const { index, dayIndex, slot } = focused;
		const start = meetup.startMinute + slot * MEETUP_SLOT_MINUTES;
		const available = responses.filter((response) => response.slots.includes(index));
		const unavailable = responses.filter((response) => !response.slots.includes(index));
		return {
			label: `${formatMeetupDay(meetup.mode, meetup.days[dayIndex])} ${formatTimeRange(start, start + MEETUP_SLOT_MINUTES)}`,
			available: available.map((response) => response.nickname),
			unavailable: unavailable.map((response) => response.nickname)
		};
	});
</script>

<svelte:window
	bind:innerWidth={viewportWidth}
	bind:innerHeight={viewportHeight}
	onpointerdown={handleWindowPointerDown}
/>

<section class="module group-availability">
	<PanelHeader
		title="전체 현황"
		description={total ? `응답 ${total}명` : '아직 응답이 없습니다.'}
	/>

	<div class="toolbar">
		<span>0명</span>
		<span class="legend" aria-hidden="true"></span>
		<span>{total}명 가능</span>
	</div>

	<SlotTable
		mode={meetup.mode}
		days={meetup.days}
		startMinute={meetup.startMinute}
		endMinute={meetup.endMinute}
		role="grid"
		aria-label="전체 현황"
		onpointermove={movePointer}
		onpointerleave={leaveTable}
		onclick={tapCell}
	>
		{#snippet cell({ index, dayIndex, slot, isHourStart, isLastDay, isLastSlot })}
			<span
				role="gridcell"
				tabindex="-1"
				class="slot"
				class:is-hour={isHourStart}
				class:is-last-day={isLastDay}
				class:is-last-slot={isLastSlot}
				class:is-focused={focused?.index === index}
				data-index={index}
				data-day={dayIndex}
				data-slot={slot}
				style:--level={getLevel(counts[index])}
			></span>
		{/snippet}
	</SlotTable>

	{#if focusedDetail}
		<div
			class="slot-popup"
			class:is-sheet={isTouch}
			role="tooltip"
			bind:clientWidth={popupWidth}
			bind:clientHeight={popupHeight}
			style:left={isTouch ? undefined : `${getPopupOffset(pointer.x, popupWidth, viewportWidth)}px`}
			style:top={isTouch
				? undefined
				: `${getPopupOffset(pointer.y, popupHeight, viewportHeight)}px`}
		>
			<strong>{focusedDetail.label}</strong>
			<p>
				<span class="is-available">가능({focusedDetail.available.length})</span>
				{focusedDetail.available.join(', ') || '없음'}
			</p>
			<p>
				<span>불가능({focusedDetail.unavailable.length})</span>
				{focusedDetail.unavailable.join(', ') || '없음'}
			</p>
		</div>
	{/if}

	{#if total}
		<p class="respondents">응답자: {responses.map((response) => response.nickname).join(', ')}</p>
	{/if}

	{#if total >= 2}
		<section class="everyone">
			<h3>모두 가능한 시간</h3>
			<p>{everyoneText || '모두 가능한 시간이 없습니다.'}</p>
		</section>
	{/if}
</section>

<style lang="scss">
	.group-availability {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		min-height: 1.8rem;
		color: var(--gray-text);
		font-size: 0.7rem;
	}

	.legend {
		border: var(--divider-border-width) solid var(--gray-border);
		border-radius: 999rem;
		background: linear-gradient(
			to right,
			var(--white),
			color-mix(in oklab, var(--primary) 20%, var(--white)),
			var(--primary)
		);
		width: 4rem;
		height: 0.6rem;
	}

	.slot {
		position: relative;
		border-top: var(--divider-border-width) dashed var(--gray-border);
		border-left: var(--divider-border-width) solid var(--gray-border);
		/* oklch 로 섞으면 무채색과 섞일 때 색상이 돌아 보라빛이 된다. */
		background: color-mix(in oklab, var(--primary) calc(var(--level) * 100%), var(--white));
	}

	.slot.is-hour {
		border-top-style: solid;
	}

	.slot.is-last-day {
		border-right: var(--divider-border-width) solid var(--gray-border);
	}

	.slot.is-last-slot {
		border-bottom: var(--divider-border-width) solid var(--gray-border);
	}

	.slot.is-focused {
		z-index: 2;
		outline: 0.1rem solid var(--text);
		outline-offset: -0.1rem;
	}

	/* 헤더보다 위에 뜨고, 칸 사이를 움직일 때 포인터를 가로채지 않는다. */
	.slot-popup {
		display: flex;
		position: fixed;
		flex-direction: column;
		gap: 0.2rem;
		z-index: 110;
		box-shadow: 0 0.2rem 0.4rem var(--shadow-color);
		border: var(--divider-border-width) solid var(--gray-border);
		border-radius: 0.8rem;
		background: var(--white);
		padding: 0.6rem 0.8rem;
		width: max-content;
		max-width: 16rem;
		pointer-events: none;
		font-size: 0.7rem;
	}

	.slot-popup.is-sheet {
		right: 0.6rem;
		bottom: 0.6rem;
		left: 0.6rem;
		width: auto;
		max-width: none;
	}

	.slot-popup > strong {
		font-weight: 600;
	}

	.slot-popup > p,
	.respondents,
	.everyone > p {
		font-size: 0.7rem;
	}

	.slot-popup span {
		margin-right: 0.4rem;
		color: var(--gray-text);
		font-weight: 600;
	}

	.slot-popup span.is-available {
		color: var(--secondary);
	}

	.everyone {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		border-radius: 0.8rem;
		background: var(--secondary-bg);
		padding: 0.6rem 0.8rem;
		font-size: 0.7rem;
	}

	.everyone > h3 {
		color: var(--tertiary);
		font-weight: 600;
		font-size: 0.8rem;
	}
</style>
