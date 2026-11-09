<script lang="ts">
	import SlotTable from './SlotTable.svelte';

	import type { BusyMeeting, SlotCell } from '$lib/shared/meetup.js';
	import type { Meetup } from '$lib/types/meetup.type.js';

	import { deserialize } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import PanelHeader from '$components/PanelHeader.svelte';
	import { getActionResultMessage } from '$lib/shared/action-result.js';
	import {
		applySlotRect,
		findFreeSlots,
		getSlotIndex,
		getSlotsPerDay
	} from '$lib/shared/meetup.js';
	import { TERM_LABELS } from '$lib/shared/view.js';

	let {
		meetup,
		savedSlots,
		selected = $bindable(),
		classMeetings,
		timetableTerm
	}: {
		meetup: Meetup;
		savedSlots: number[];
		selected: Set<number>;
		classMeetings: BusyMeeting[];
		timetableTerm: { year: number; term: number };
	} = $props();

	type Drag = { anchor: SlotCell; current: SlotCell; mode: 'add' | 'remove' };

	/** 드래그를 이어서 할 때 요청을 한 번으로 묶는 대기 시간. */
	const SAVE_DELAY_MS = 500;
	const SAVE_ERROR_MESSAGE = '저장하지 못했습니다.';

	const toSlotsValue = (slots: Iterable<number>) => [...slots].sort((a, b) => a - b).join(',');

	const slotsPerDay = $derived(getSlotsPerDay(meetup.startMinute, meetup.endMinute));

	let drag = $state<Drag | null>(null);
	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'failed'>('idle');
	let saveError = $state('');
	/** 서버에 저장된 값. 저장 뒤에는 페이지를 다시 불러오지 않으므로 여기서 갱신한다. */
	let savedValue = $derived(toSlotsValue(savedSlots));
	let isSending = false;
	let saveTimer: ReturnType<typeof setTimeout> | undefined;

	const shown = $derived(
		drag ? applySlotRect(selected, drag.anchor, drag.current, drag.mode, slotsPerDay) : selected
	);
	const slotsValue = $derived(toSlotsValue(selected));
	const isDirty = $derived(slotsValue !== savedValue);
	const termLabel = $derived(`${timetableTerm.year}년 ${TERM_LABELS[timetableTerm.term]}학기`);
	/** 확정 시간표의 수업과 겹치는 칸. 칠하지는 않고 회색으로 보여주기만 한다. */
	const classSlots = $derived.by(() => {
		if (!classMeetings.length) return new Set<number>();
		const free = findFreeSlots(
			meetup.mode,
			meetup.days,
			meetup.startMinute,
			meetup.endMinute,
			classMeetings
		);
		const total = meetup.days.length * slotsPerDay;
		return new Set(
			Array.from({ length: total }, (_, slot) => slot).filter((slot) => !free.has(slot))
		);
	});

	/** keepalive 라서 요청 중에 페이지를 떠나도 끝까지 전송된다. */
	const postSlots = async (value: string) => {
		const body = new FormData();
		body.set('slots', value);
		const response = await fetch('?/respond', { method: 'POST', body, keepalive: true });
		return deserialize(await response.text());
	};

	/** 요청은 한 번에 하나만 보낸다. 늦게 도착한 옛 선택이 최신 선택을 덮지 않게 하려는 것이다. */
	const saveNow = async () => {
		clearTimeout(saveTimer);
		if (isSending || !isDirty) return;
		isSending = true;
		saveStatus = 'saving';
		const value = slotsValue;
		let message = '';
		try {
			const result = await postSlots(value);
			if (result.type !== 'success') {
				message = getActionResultMessage(result, SAVE_ERROR_MESSAGE) || SAVE_ERROR_MESSAGE;
			}
		} catch {
			message = SAVE_ERROR_MESSAGE;
		}
		isSending = false;
		if (message) {
			saveStatus = 'failed';
			saveError = message;
			return;
		}
		savedValue = value;
		if (isDirty) await saveNow();
		else saveStatus = 'saved';
	};

	const scheduleSave = () => {
		clearTimeout(saveTimer);
		if (isDirty) {
			saveStatus = 'saving';
			saveTimer = setTimeout(saveNow, SAVE_DELAY_MS);
		} else if (!isSending) {
			saveStatus = 'saved';
		}
	};

	const clearAll = () => {
		if (!confirm('내 응답을 모두 지웁니다. 계속할까요?')) return;
		selected = new Set();
		saveNow();
	};

	beforeNavigate(({ type, cancel }) => {
		if (!isDirty) return;
		// 저장에 실패한 변경은 사라지므로 물어본다. 탭을 닫거나 새로고침할 때는 브라우저 확인창이 뜬다.
		if (saveStatus === 'failed') {
			if (type === 'leave') return cancel();
			if (!confirm('저장하지 못한 변경이 있습니다. 페이지를 나갈까요?')) cancel();
			return;
		}
		clearTimeout(saveTimer);
		postSlots(slotsValue).catch(() => {});
		savedValue = slotsValue;
	});

	const readCell = (target: Element | null): SlotCell | null => {
		const element = target?.closest<HTMLElement>('[data-day]');
		if (!element) return null;
		return { day: Number(element.dataset.day), slot: Number(element.dataset.slot) };
	};

	const startDrag = (event: PointerEvent) => {
		const cell = readCell(event.target as Element);
		if (!cell) return;
		event.preventDefault();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		const isSelected = selected.has(getSlotIndex(cell, slotsPerDay));
		drag = { anchor: cell, current: cell, mode: isSelected ? 'remove' : 'add' };
	};

	// 포인터를 잡고 있으면 이벤트가 표에만 오므로, 손가락 아래 칸은 좌표로 찾는다.
	const moveDrag = (event: PointerEvent) => {
		if (!drag) return;
		const cell = readCell(document.elementFromPoint(event.clientX, event.clientY));
		if (!cell || (cell.day === drag.current.day && cell.slot === drag.current.slot)) return;
		drag = { ...drag, current: cell };
	};

	const endDrag = () => {
		if (!drag) return;
		selected = shown;
		drag = null;
		scheduleSave();
	};
</script>

<section class="module my-availability">
	<PanelHeader title="내 일정" description="가능한 시간을 드래그하면 자동으로 저장됩니다." />

	<div class="toolbar">
		<button
			type="button"
			class="ui-button is-secondary is-compact"
			disabled={!selected.size}
			onclick={clearAll}
		>
			모두 지우기
		</button>
		<div class="save-status" class:is-failed={saveStatus === 'failed'} role="status">
			{#if saveStatus === 'saving'}
				<span>저장 중...</span>
			{:else if saveStatus === 'saved'}
				<span>저장됨</span>
			{:else if saveStatus === 'failed'}
				<span>{saveError}</span>
				<button type="button" class="ui-button is-secondary is-compact" onclick={saveNow}>
					다시 시도
				</button>
			{/if}
		</div>
	</div>

	<SlotTable
		mode={meetup.mode}
		days={meetup.days}
		startMinute={meetup.startMinute}
		endMinute={meetup.endMinute}
		isEditable
		role="grid"
		aria-label="내 일정 선택"
		onpointerdown={startDrag}
		onpointermove={moveDrag}
		onpointerup={endDrag}
		onpointercancel={endDrag}
	>
		{#snippet cell({ index, dayIndex, slot, isHourStart, isLastDay, isLastSlot })}
			<span
				role="gridcell"
				aria-selected={shown.has(index)}
				data-day={dayIndex}
				data-slot={slot}
				class:is-hour={isHourStart}
				class:is-last-day={isLastDay}
				class:is-last-slot={isLastSlot}
				class:is-selected={shown.has(index)}
				class:is-class={classSlots.has(index)}
			></span>
		{/snippet}
	</SlotTable>

	{#if classSlots.size}
		<p class="class-legend">
			<span aria-hidden="true"></span>{termLabel} 시간표의 수업 시간
		</p>
	{/if}
</section>

<style lang="scss">
	.my-availability {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		min-height: 1.8rem;
	}

	.save-status {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-left: auto;
		color: var(--gray-text);
		font-size: 0.7rem;
	}

	.save-status.is-failed {
		color: var(--error-text);
	}

	span[role='gridcell'] {
		border-top: var(--divider-border-width) dashed var(--gray-border);
		border-left: var(--divider-border-width) solid var(--gray-border);
		background: var(--gray-bg);
	}

	span.is-hour {
		border-top-style: solid;
	}

	span.is-last-day {
		border-right: var(--divider-border-width) solid var(--gray-border);
	}

	span.is-last-slot {
		border-bottom: var(--divider-border-width) solid var(--gray-border);
	}

	/* 수업 칸. 선택한 칸은 선택 색이 이긴다. */
	span.is-class,
	.class-legend > span {
		background: var(--gray-border);
	}

	/* 칸 선이 배경과 같은 회색이라 묻히므로 수업 칸 안에서는 흰색으로 그린다. */
	span.is-class:not(.is-selected) {
		border-color: var(--white);
	}

	span.is-selected {
		background: var(--secondary);
	}

	.class-legend {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--gray-text);
		font-size: 0.7rem;
	}

	.class-legend > span {
		border: var(--divider-border-width) solid var(--gray-border);
		width: 1rem;
		height: 0.6rem;
	}
</style>
