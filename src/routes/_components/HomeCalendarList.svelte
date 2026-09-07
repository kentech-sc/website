<script lang="ts">
	import type { AcademicSchedule } from '$lib/types/academic-calendar.type.js';

	import { entriesOn, isSpan } from '$lib/shared/academic-calendar.js';
	import {
		getDayOfMonth,
		getMonthDayKeys,
		getMonthOfDay,
		getWeekdayIndex
	} from '$lib/shared/day-key.js';

	let { schedule }: { schedule: AcademicSchedule | null } = $props();

	const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];

	function toShortLabel(dayKey: string): string {
		return `${getMonthOfDay(dayKey)}/${getDayOfMonth(dayKey)}`;
	}

	// 오늘은 서버(KST)가 정해 내려준다. 여기서 new Date() 를 쓰면
	// 서버(UTC)와 브라우저(KST)가 서로 다른 날짜를 그린다.
	const monthDays = $derived(schedule ? getMonthDayKeys(schedule.today) : []);

	// 기간 일정은 날짜마다 반복되면 목록을 뒤덮으므로 위에 기간 한 줄로 모은다.
	// 실제 학사일정의 절반 이상이 기간 일정이라 이 분리가 목록안의 핵심이다.
	const spanning = $derived(
		schedule
			? schedule.entries
					.filter(
						(entry) =>
							isSpan(entry) &&
							entry.startDay <= monthDays[monthDays.length - 1] &&
							entry.endDay >= monthDays[0]
					)
					.map((entry) => ({
						subject: entry.subject,
						range: `${toShortLabel(entry.startDay)} ~ ${toShortLabel(entry.endDay)}`,
						isOngoing: entry.startDay <= schedule.today && schedule.today <= entry.endDay
					}))
			: []
	);

	// 날짜별 목록에는 하루짜리 일정만 남긴다.
	const dayList = $derived(
		schedule
			? monthDays
					.map((dayKey) => ({
						dayKey,
						label: toShortLabel(dayKey),
						weekday: weekdayNames[getWeekdayIndex(dayKey)],
						isToday: dayKey === schedule.today,
						isPast: dayKey < schedule.today,
						entries: entriesOn(schedule.entries, dayKey).filter((entry) => !isSpan(entry))
					}))
					.filter((day) => day.entries.length > 0)
			: []
	);
</script>

<section class="calendar module">
	<h2>학사일정<small>{schedule ? `${getMonthOfDay(schedule.today)}월` : ''}</small></h2>

	{#if !schedule}
		<p class="notice">학사일정을 불러오지 못했습니다.</p>
	{:else}
		{#each spanning as entry, index (index)}
			<p class="span-note ellipsis" class:ongoing={entry.isOngoing} title={entry.subject}>
				<span class="span-range">{entry.range}</span>{entry.subject}
			</p>
		{/each}

		<ul class="day-list">
			{#each dayList as day (day.dayKey)}
				<li class="day" class:today={day.isToday} class:past={day.isPast}>
					<span class="day-label">{day.label}<small>{day.weekday}</small></span>
					<span class="entries">
						{#each day.entries as entry, index (index)}
							<span class="entry">{entry.subject}</span>
						{/each}
					</span>
				</li>
			{:else}
				<li class="empty">이번 달 등록된 일정이 없습니다.</li>
			{/each}
		</ul>
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
		align-items: flex-end;
		margin-bottom: 0.6rem;
		font-size: 1.2rem;

		small {
			color: var(--secondary-text);
			font-size: 0.7rem;
		}
	}

	.span-note {
		margin-bottom: 0.3rem;
		border-radius: 0.3rem;
		background-color: var(--gray-bg);
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
	}

	// 오늘이 기간 안에 든 일정만 강조한다.
	.span-note.ongoing {
		background-color: var(--secondary-bg);
	}

	.span-range {
		display: inline-block;
		margin-right: 0.5rem;
		color: var(--secondary-text);
	}

	.day-list {
		display: flex;
		flex: 1;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.day {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 0.4rem 0.3rem;

		&:not(:last-child) {
			border-bottom: var(--control-border-width) solid var(--gray-border);
		}
	}

	.day.past {
		opacity: 0.5;
	}

	.day.today .day-label {
		color: var(--secondary);
		font-weight: bold;
	}

	.day-label {
		flex-shrink: 0;
		width: 3.6rem;
		font-size: 0.85rem;

		small {
			margin-left: 0.2rem;
			color: var(--secondary-text);
			font-size: 0.7rem;
		}
	}

	.entries {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	.entry {
		border-radius: 0.2rem;
		background-color: var(--secondary-bg);
		padding: 0 0.3rem;
		font-size: 0.85rem;
	}

	.empty,
	.notice {
		flex: 1;
		padding-top: 1rem;
		color: var(--secondary-text);
		font-size: 0.9rem;
		text-align: center;
	}
</style>
