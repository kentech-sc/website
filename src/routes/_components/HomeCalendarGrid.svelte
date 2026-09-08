<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	import { CalendarNav } from './home-calendar-nav.svelte.js';

	import type { AcademicSchedule, ScheduleEntry } from '$lib/types/academic-calendar.type.js';

	import { entriesInRange } from '$lib/shared/academic-calendar.js';
	import {
		addDays,
		getDayOfMonth,
		getMonthOfDay,
		getTwoWeekDayKeys,
		getWeekOfMonth
	} from '$lib/shared/day-key.js';

	let { schedule: initialSchedule }: { schedule: AcademicSchedule | null } = $props();

	const nav = new CalendarNav(() => initialSchedule);
	const schedule = $derived(nav.schedule);

	// 주는 일요일에 시작한다. getTwoWeekDayKeys 가 같은 기준으로 날짜를 뽑는다.
	const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

	interface Segment {
		subject: string;
		/** 0-6, 그 주 안에서의 시작 칸 */
		startIndex: number;
		length: number;
		/** 지난 주에서 이어져 왔는지 / 다음 주로 이어지는지 */
		continuesBefore: boolean;
		continuesAfter: boolean;
		lane: number;
	}

	/**
	 * 한 주에 걸치는 일정을 막대 하나로 만든다.
	 * 주 경계를 넘는 일정은 주마다 잘리므로 제목이 주마다 다시 보인다.
	 */
	function toSegments(entries: ScheduleEntry[], weekDays: string[]): Segment[] {
		const weekStart = weekDays[0];
		const weekEnd = weekDays[6];

		const clipped = entriesInRange(entries, weekStart, weekEnd).map((entry) => {
			const startIndex = entry.startDay <= weekStart ? 0 : weekDays.indexOf(entry.startDay);
			const endIndex = entry.endDay >= weekEnd ? 6 : weekDays.indexOf(entry.endDay);
			return {
				subject: entry.subject,
				startIndex,
				length: endIndex - startIndex + 1,
				continuesBefore: entry.startDay < weekStart,
				continuesAfter: entry.endDay > weekEnd
			};
		});

		// 긴 일정을 위쪽 줄에 두고, 겹치지 않는 것끼리 같은 줄에 채운다.
		const sorted = clipped.sort(
			(a, b) =>
				b.length - a.length || a.startIndex - b.startIndex || a.subject.localeCompare(b.subject)
		);

		// 줄마다 점유 구간을 모두 기억한다. 끝 칸만 기억하면 뒤에 이어 붙이는 것만 가능해져,
		// 이미 놓인 막대의 앞쪽이 비어 있어도 새 줄로 밀려난다.
		const laneRanges: Array<Array<{ start: number; end: number }>> = [];

		return sorted.map((segment) => {
			const start = segment.startIndex;
			const end = segment.startIndex + segment.length - 1;
			const fits = (ranges: Array<{ start: number; end: number }>) =>
				ranges.every((range) => end < range.start || start > range.end);

			let lane = laneRanges.findIndex(fits);
			if (lane === -1) {
				lane = laneRanges.length;
				laneRanges.push([]);
			}
			laneRanges[lane].push({ start, end });
			return { ...segment, lane };
		});
	}

	// 오늘은 서버(KST)가 정해 내려준다. 여기서 new Date() 를 쓰면
	// 서버(UTC)와 브라우저(KST)가 서로 다른 날짜를 그린다.
	const weeks = $derived(
		schedule
			? [0, 1].map((weekIndex) => {
					const weekDays = getTwoWeekDayKeys(schedule.anchor).slice(
						weekIndex * 7,
						weekIndex * 7 + 7
					);
					const segments = toSegments(schedule.entries, weekDays);
					return {
						key: weekDays[0],
						days: weekDays.map((dayKey) => ({
							dayKey,
							day: getDayOfMonth(dayKey),
							isToday: dayKey === schedule.today,
							isMonthStart: getDayOfMonth(dayKey) === 1
						})),
						segments,
						laneCount: segments.reduce((max, segment) => Math.max(max, segment.lane + 1), 0)
					};
				})
			: []
	);

	const firstDayKey = $derived(schedule ? getTwoWeekDayKeys(schedule.anchor)[0] : '');
</script>

<section class="calendar module">
	<h2>
		학사일정
		{#if schedule}
			<span class="range-nav">
				<button
					type="button"
					aria-label="이전 2주"
					disabled={nav.loading}
					onclick={() => nav.moveTo(addDays(schedule.anchor, -14))}
				>
					<ChevronLeft size="1rem" />
				</button>
				<span class="range">
					{getMonthOfDay(firstDayKey)}월 {getWeekOfMonth(firstDayKey)}주차
				</span>
				<button
					type="button"
					aria-label="다음 2주"
					disabled={nav.loading}
					onclick={() => nav.moveTo(addDays(schedule.anchor, 14))}
				>
					<ChevronRight size="1rem" />
				</button>
			</span>
		{/if}
	</h2>

	{#if nav.errorMessage}
		<p class="notice">{nav.errorMessage}</p>
	{:else if schedule}
		<div class="grid">
			<div class="weekday-row">
				{#each weekdays as weekday (weekday)}
					<span class="weekday">{weekday}</span>
				{/each}
			</div>

			{#each weeks as week (week.key)}
				<div class="week" style="--lane-count: {week.laneCount}">
					{#each week.days as day, index (day.dayKey)}
						<div class="cell" class:today={day.isToday} style="grid-column: {index + 1}"></div>
					{/each}

					{#each week.days as day, index (day.dayKey)}
						<span class="day-number" class:today={day.isToday} style="grid-column: {index + 1}">
							{day.isMonthStart ? `${getMonthOfDay(day.dayKey)}월 1일` : day.day}
						</span>
					{/each}

					{#each week.segments as segment, index (index)}
						<span
							class="bar"
							class:continues-before={segment.continuesBefore}
							class:continues-after={segment.continuesAfter}
							style="grid-column: {segment.startIndex +
								1} / span {segment.length}; grid-row: {segment.lane + 2}"
							title={segment.subject}
						>
							{segment.subject}
						</span>
					{/each}
				</div>
			{/each}
		</div>
	{:else}
		<p class="notice">학사일정을 불러오지 못했습니다.</p>
	{/if}
</section>

<style lang="scss">
	.calendar {
		display: flex;
		flex-direction: column;
	}

	h2 {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.6rem;
		font-size: 1.2rem;
	}

	.range-nav {
		display: flex;
		align-items: center;
		gap: 0.3rem;

		button {
			display: flex;
			align-items: center;
			padding: 0.1rem 0.3rem;
		}
	}

	.range {
		min-width: 5.5rem;
		font-size: 0.8rem;
		text-align: center;
	}

	// 칸 사이 여백 없이 테두리를 공유한다. 바깥 테두리는 여기서 한 번만 그린다.
	.grid {
		display: flex;
		flex: 1;
		flex-direction: column;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.3rem;
		overflow: hidden;
	}

	.weekday-row {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		border-bottom: var(--control-border-width) solid var(--gray-border);
		background-color: var(--gray-bg);
	}

	.weekday {
		padding: 0.2rem 0;
		color: var(--secondary-text);
		font-weight: bold;
		font-size: 0.7rem;
		text-align: center;
	}

	/**
	 * 한 주가 하나의 격자다. 1행은 날짜 숫자, 2행부터 일정 막대가 들어가는 줄(lane).
	 * 배경 칸(.cell)이 모든 행을 가로질러 세로 구분선을 만든다.
	 */
	.week {
		display: grid;
		grid-template-rows: auto repeat(var(--lane-count), auto) 1fr;
		// 마지막 1fr 은 남는 높이를 흡수하는 빈 줄이다.
		// 이게 없으면 카드가 학식 높이에 맞춰 늘어날 때 격자 아래가 통째로 빈다.
		grid-template-columns: repeat(7, minmax(0, 1fr));
		row-gap: 0.15rem;
		flex: 1;
		padding-bottom: 0.25rem;

		&:not(:last-child) {
			border-bottom: var(--control-border-width) solid var(--gray-border);
		}
	}

	.cell {
		grid-row: 1 / -1;
		border-right: var(--control-border-width) solid var(--gray-border);
		min-height: 2.5rem;

		// 마지막 칸의 세로선은 바깥 테두리와 겹친다.
		&:nth-child(7) {
			border-right: none;
		}
	}

	.cell.today {
		background-color: var(--secondary-bg);
	}

	.day-number {
		grid-row: 1;
		padding: 0.2rem 0.3rem;
		font-size: 0.7rem;
		text-align: center;
	}

	.day-number.today {
		color: var(--secondary);
		font-weight: bold;
	}

	// 기간 일정은 걸친 날짜를 가로질러 하나의 막대로 이어진다.
	.bar {
		// 줄 높이만큼만 차지하게 해 막대가 칸 높이로 늘어나지 않도록 한다.
		align-self: start;
		z-index: 1;
		margin: 0 0.15rem;
		border-radius: 0.2rem;
		background-color: var(--secondary);
		padding: 0.05rem 0.3rem;
		overflow: hidden;
		color: var(--tertiary-text);
		font-weight: bold;
		font-size: 0.65rem;
		line-height: 1.4;
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	// 주 경계를 넘어 이어지는 쪽은 모서리를 각지게 해 계속됨을 보인다.
	.bar.continues-before {
		margin-left: 0;
		border-start-start-radius: 0;
		border-end-start-radius: 0;
	}

	.bar.continues-after {
		margin-right: 0;
		border-start-end-radius: 0;
		border-end-end-radius: 0;
	}

	.notice {
		flex: 1;
		padding-top: 2rem;
		color: var(--secondary-text);
		font-size: 0.9rem;
		text-align: center;
	}
</style>
