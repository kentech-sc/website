<script lang="ts">
	import {
		entriesOn,
		getMonthDays,
		isSpan,
		sampleSchedule,
		toDayKey
	} from './home-schedule-sample.js';

	// 달력 안 비교용 목록안. 목록은 한 달치를 보여준다. 데이터는 아직 임시 상수를 쓴다.
	const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];
	const today = new Date();
	const todayKey = toDayKey(today);
	const days = getMonthDays(today);
	const windowStart = toDayKey(days[0]);
	const windowEnd = toDayKey(days[days.length - 1]);

	function toRangeLabel(day: string): string {
		const [, month, date] = day.split('-');
		return `${Number(month)}/${Number(date)}`;
	}

	// 기간 일정은 날짜마다 반복되면 목록을 뒤덮으므로 위에 기간 한 줄로 모은다.
	const spanning = sampleSchedule
		.filter((entry) => isSpan(entry) && entry.startDay <= windowEnd && entry.endDay >= windowStart)
		.map((entry) => ({
			subject: entry.subject,
			range: `${toRangeLabel(entry.startDay)} ~ ${toRangeLabel(entry.endDay)}`
		}));

	// 날짜별 목록에는 하루짜리 일정만 남긴다.
	const dayList = $derived(
		days
			.map((date) => {
				const key = toDayKey(date);
				return {
					key,
					label: `${date.getMonth() + 1}/${date.getDate()}`,
					weekday: weekdayNames[date.getDay()],
					isToday: key === todayKey,
					entries: entriesOn(sampleSchedule, key).filter((entry) => !isSpan(entry))
				};
			})
			.filter((day) => day.entries.length > 0)
	);
</script>

<section class="calendar module">
	<h2>학사일정<small>{today.getMonth() + 1}월</small></h2>

	{#each spanning as entry (entry.subject)}
		<p class="span-note ellipsis" title={entry.subject}>
			<span class="span-range">{entry.range}</span>{entry.subject}
		</p>
	{/each}

	<ul class="day-list">
		{#each dayList as day (day.key)}
			<li class="day" class:today={day.isToday}>
				<span class="day-label">{day.label}<small>{day.weekday}</small></span>
				<span class="entries">
					{#each day.entries as entry (entry.subject)}
						<span class="entry">{entry.subject}</span>
					{/each}
				</span>
			</li>
		{:else}
			<li class="empty">이번 달 등록된 일정이 없습니다.</li>
		{/each}
	</ul>
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

	.empty {
		flex: 1;
		padding-top: 1rem;
		color: var(--secondary-text);
		font-size: 0.9rem;
		text-align: center;
	}
</style>
