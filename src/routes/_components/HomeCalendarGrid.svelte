<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	import { CalendarNav } from './home-calendar-nav.svelte.js';

	import type { AcademicSchedule } from '$lib/types/academic-calendar.type.js';

	import { entriesOn } from '$lib/shared/academic-calendar.js';
	import { addDays, getDayOfMonth, getMonthOfDay, getTwoWeekDayKeys } from '$lib/shared/day-key.js';

	let { schedule: initialSchedule }: { schedule: AcademicSchedule | null } = $props();

	const nav = new CalendarNav(() => initialSchedule);
	const schedule = $derived(nav.schedule);

	const weekdays = ['월', '화', '수', '목', '금', '토', '일'];

	// 오늘은 서버(KST)가 정해 내려준다. 여기서 new Date() 를 쓰면
	// 서버(UTC)와 브라우저(KST)가 서로 다른 날짜를 그린다.
	const days = $derived(
		schedule
			? getTwoWeekDayKeys(schedule.anchor).map((dayKey) => ({
					dayKey,
					day: getDayOfMonth(dayKey),
					isToday: dayKey === schedule.today,
					entries: entriesOn(schedule.entries, dayKey)
				}))
			: []
	);
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
				<span class="range">{getMonthOfDay(days[0].dayKey)}월 {days[0].day}일부터</span>
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
		<div class="weekday-row">
			{#each weekdays as weekday (weekday)}
				<span class="weekday">{weekday}</span>
			{/each}
		</div>

		<div class="day-grid">
			{#each days as day (day.dayKey)}
				<div class="day" class:today={day.isToday}>
					<span class="day-number">{day.day}</span>
					{#each day.entries as entry, index (index)}
						<span class="entry ellipsis" title={entry.subject}>{entry.subject}</span>
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

	.weekday-row,
	.day-grid {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 0.2rem;
	}

	.weekday {
		padding-bottom: 0.2rem;
		color: var(--secondary-text);
		font-size: 0.75rem;
		text-align: center;
	}

	.day-grid {
		grid-template-rows: repeat(2, minmax(0, 1fr));
		flex: 1;
	}

	.day {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.3rem;
		background-color: var(--gray-bg);
		padding: 0.25rem;
		// 일정 한두 줄이 들어갈 자리.
		min-height: 4.5rem;
		overflow: hidden;
	}

	.day.today {
		border-color: var(--secondary);
		background-color: var(--secondary-bg);
	}

	.day-number {
		font-size: 0.75rem;
	}

	.entry {
		border-radius: 0.2rem;
		background-color: var(--secondary);
		padding: 0 0.2rem;
		color: var(--tertiary-text);
		font-size: 0.65rem;
	}

	.notice {
		flex: 1;
		padding-top: 2rem;
		color: var(--secondary-text);
		font-size: 0.9rem;
		text-align: center;
	}
</style>
