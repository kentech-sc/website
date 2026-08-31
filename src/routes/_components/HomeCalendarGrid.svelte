<script lang="ts">
	import { entriesOn, getTwoWeekDays, sampleSchedule, toDayKey } from './home-schedule-sample.js';

	// 달력 안 비교용 격자안. 데이터는 아직 임시 상수를 쓴다.
	const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
	const todayKey = toDayKey(new Date());

	const days = $derived(
		getTwoWeekDays().map((date) => {
			const key = toDayKey(date);
			return {
				key,
				day: date.getDate(),
				isToday: key === todayKey,
				entries: entriesOn(sampleSchedule, key)
			};
		})
	);
</script>

<section class="calendar module">
	<h2>학사일정<small>2주</small></h2>

	<div class="weekday-row">
		{#each weekdays as weekday (weekday)}
			<span class="weekday">{weekday}</span>
		{/each}
	</div>

	<div class="day-grid">
		{#each days as day (day.key)}
			<div class="day" class:today={day.isToday}>
				<span class="day-number">{day.day}</span>
				{#each day.entries as entry (entry.subject)}
					<span class="entry ellipsis" title={entry.subject}>{entry.subject}</span>
				{/each}
			</div>
		{/each}
	</div>
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
</style>
