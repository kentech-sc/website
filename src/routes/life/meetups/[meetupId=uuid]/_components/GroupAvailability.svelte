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
		getOutlineEdges,
		getSlotsPerDay,
		groupSlotRanges
	} from '$lib/shared/meetup.js';

	let {
		meetup,
		responses,
		isPreview
	}: {
		meetup: Meetup;
		responses: MeetupResponse[];
		/** 내 저장 전 선택이 반영돼 있다. */
		isPreview: boolean;
	} = $props();

	const OUTLINE = '0.1rem';
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

	/** 모두 되는 칸 묶음의 바깥 변에만 선을 긋는다. 맞닿은 변은 비워 둔다. */
	const getOutline = (dayIndex: number, slot: number) => {
		const edges = getOutlineEdges(
			everyoneSlots,
			{ day: dayIndex, slot },
			slotsPerDay,
			meetup.days.length
		);
		const shadows = [
			edges.top && `inset 0 ${OUTLINE} 0 0 var(--tertiary)`,
			edges.right && `inset -${OUTLINE} 0 0 0 var(--tertiary)`,
			edges.bottom && `inset 0 -${OUTLINE} 0 0 var(--tertiary)`,
			edges.left && `inset ${OUTLINE} 0 0 0 var(--tertiary)`
		].filter(Boolean);
		return shadows.length ? shadows.join(', ') : undefined;
	};

	/** 가리키거나 누른 칸. 그 칸에 누가 되는지 보여준다. */
	let focused = $state<{ index: number; dayIndex: number; slot: number } | null>(null);

	const focusedDetail = $derived.by(() => {
		if (!focused) return null;
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

<section class="module group-availability">
	<PanelHeader
		title="전체 현황"
		description={total
			? `응답 ${total}명${isPreview ? ' (저장 전 내 선택 포함)' : ''}`
			: '아직 응답이 없습니다.'}
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
		onpointerleave={() => (focused = null)}
	>
		{#snippet cell({ index, dayIndex, slot, isHourStart })}
			{@const count = counts[index]}
			<span
				role="gridcell"
				tabindex="-1"
				class="slot"
				class:is-hour={isHourStart}
				style:--level={getLevel(count)}
				style:box-shadow={everyoneSlots.has(index) ? getOutline(dayIndex, slot) : undefined}
				title={`${count}/${total}명 가능`}
				onpointerenter={() => (focused = { index, dayIndex, slot })}
			></span>
		{/snippet}
	</SlotTable>

	<div class="detail" aria-live="polite">
		{#if focusedDetail}
			<strong>{focusedDetail.label}</strong>
			<p>
				<span class="is-available">가능({focusedDetail.available.length})</span>
				{focusedDetail.available.join(', ') || '없음'}
			</p>
			<p>
				<span>불가능({focusedDetail.unavailable.length})</span>
				{focusedDetail.unavailable.join(', ') || '없음'}
			</p>
		{:else if total}
			<p>응답자: {responses.map((response) => response.nickname).join(', ')}</p>
		{/if}
	</div>

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
			var(--gray-bg),
			color-mix(in oklab, var(--secondary) 20%, var(--gray-bg)),
			var(--secondary)
		);
		width: 4rem;
		height: 0.6rem;
	}

	.slot {
		border-top: var(--divider-border-width) dashed var(--gray-border);
		border-left: var(--divider-border-width) solid var(--gray-border);
		/* oklch 로 섞으면 무채색과 섞일 때 색상이 돌아 보라빛이 된다. */
		background: color-mix(in oklab, var(--secondary) calc(var(--level) * 100%), var(--gray-bg));
	}

	.slot.is-hour {
		border-top-style: solid;
	}

	.detail {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-height: 3.2rem;
		font-size: 0.7rem;
	}

	.detail > strong {
		font-weight: 600;
	}

	.detail > p,
	.everyone > p {
		font-size: 0.7rem;
	}

	.detail span {
		margin-right: 0.4rem;
		color: var(--gray-text);
		font-weight: 600;
	}

	.detail span.is-available {
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
