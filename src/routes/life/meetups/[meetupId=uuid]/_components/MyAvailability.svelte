<script lang="ts">
	import SlotTable from './SlotTable.svelte';

	import type { BusyMeeting, SlotCell } from '$lib/shared/meetup.js';
	import type { Meetup } from '$lib/types/meetup.type.js';

	import { beforeNavigate } from '$app/navigation';
	import ActionForm from '$components/ActionForm.svelte';
	import PanelHeader from '$components/PanelHeader.svelte';
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

	const slotsPerDay = $derived(getSlotsPerDay(meetup.startMinute, meetup.endMinute));

	let drag = $state<Drag | null>(null);
	let isSaving = $state(false);

	const shown = $derived(
		drag ? applySlotRect(selected, drag.anchor, drag.current, drag.mode, slotsPerDay) : selected
	);
	const isDirty = $derived(
		selected.size !== savedSlots.length || savedSlots.some((slot) => !selected.has(slot))
	);
	const slotsValue = $derived([...selected].sort((a, b) => a - b).join(','));
	const termLabel = $derived(`${timetableTerm.year}년 ${TERM_LABELS[timetableTerm.term]}학기`);
	/** 확정 시간표의 수업과 겹치는 칸. 칠하지는 않고 연한 빨강으로 보여주기만 한다. */
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

	beforeNavigate(({ type, cancel }) => {
		if (!isDirty || isSaving) return;
		// 탭을 닫거나 새로고침할 때는 브라우저 확인창이 대신 뜬다.
		if (type === 'leave') return cancel();
		if (!confirm('저장하지 않은 변경이 있습니다. 페이지를 나갈까요?')) cancel();
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
	};
</script>

<section class="module my-availability">
	<PanelHeader title="내 일정" description="가능한 시간을 드래그해 선택하세요." />

	<div class="toolbar">
		<button
			type="button"
			class="ui-button is-secondary is-compact"
			disabled={!selected.size}
			onclick={() => (selected = new Set())}
		>
			모두 지우기
		</button>
		<div class="save">
			<ActionForm actionName="respond" policy="reload" bind:loading={isSaving}>
				<input type="hidden" name="slots" value={slotsValue} />
				<div class="save-row">
					{#if isDirty}<span>저장되지 않음</span>{/if}
					<button type="submit" class="ui-button is-primary is-compact" disabled={!isDirty}>
						{savedSlots.length && !selected.size ? '응답 취소' : '저장'}
					</button>
				</div>
			</ActionForm>
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
		{#snippet cell({ index, dayIndex, slot, isHourStart })}
			<span
				role="gridcell"
				aria-selected={shown.has(index)}
				data-day={dayIndex}
				data-slot={slot}
				class:is-hour={isHourStart}
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

	.save {
		margin-left: auto;
	}

	.save-row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--warn-text);
		font-size: 0.7rem;
	}

	span[role='gridcell'] {
		border-top: var(--divider-border-width) dashed var(--gray-border);
		border-left: var(--divider-border-width) solid var(--gray-border);
		background: var(--gray-bg);
	}

	span.is-hour {
		border-top-style: solid;
	}

	/* 수업 칸. 선택한 칸은 선택 색이 이긴다. */
	span.is-class,
	.class-legend > span {
		background: color-mix(in oklab, var(--error) 25%, var(--white));
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
