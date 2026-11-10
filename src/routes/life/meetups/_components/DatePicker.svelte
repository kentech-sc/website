<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import X from '@lucide/svelte/icons/x';

	import { MEETUP_MAX_DAYS, formatMeetupDay } from '$lib/shared/meetup.js';

	let { name, selected = $bindable([]) }: { name: string; selected: string[] } = $props();

	const WEEKDAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토'];

	const toKey = (year: number, month: number, date: number) =>
		`${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

	const today = new Date();
	const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());
	const todayMonthIndex = today.getFullYear() * 12 + today.getMonth();

	let viewYear = $state(today.getFullYear());
	let viewMonth = $state(today.getMonth());

	/** 일요일 시작 달력. 앞의 빈칸은 null. */
	const cells = $derived.by(() => {
		const lead = new Date(viewYear, viewMonth, 1).getDay();
		const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
		return [
			...Array.from({ length: lead }, () => null),
			...Array.from({ length: daysInMonth }, (_, index) => toKey(viewYear, viewMonth, index + 1))
		];
	});
	const isFull = $derived(selected.length >= MEETUP_MAX_DAYS);
	const canGoPrev = $derived(viewYear * 12 + viewMonth > todayMonthIndex);

	const moveMonth = (offset: number) => {
		const next = new Date(viewYear, viewMonth + offset, 1);
		viewYear = next.getFullYear();
		viewMonth = next.getMonth();
	};

	const toggle = (key: string) => {
		selected = selected.includes(key)
			? selected.filter((item) => item !== key)
			: [...selected, key].sort();
	};
</script>

<div class="date-picker">
	<header>
		<button
			type="button"
			class="ui-button is-icon"
			aria-label="이전 달"
			disabled={!canGoPrev}
			onclick={() => moveMonth(-1)}
		>
			<ChevronLeft size="1rem" />
		</button>
		<strong>{viewYear}년 {viewMonth + 1}월</strong>
		<button
			type="button"
			class="ui-button is-icon"
			aria-label="다음 달"
			onclick={() => moveMonth(1)}
		>
			<ChevronRight size="1rem" />
		</button>
	</header>

	<div class="calendar" role="group" aria-label="후보 날짜">
		{#each WEEKDAY_HEADERS as label (label)}
			<span>{label}</span>
		{/each}
		{#each cells as key, index (key ?? `blank-${index}`)}
			{#if key}
				{@const isSelected = selected.includes(key)}
				<button
					type="button"
					class:is-today={key === todayKey}
					aria-pressed={isSelected}
					aria-label={key}
					disabled={key < todayKey || (isFull && !isSelected)}
					onclick={() => toggle(key)}
				>
					{Number(key.slice(8))}
				</button>
			{:else}
				<span></span>
			{/if}
		{/each}
	</div>

	<p>{selected.length}일 선택 (최대 {MEETUP_MAX_DAYS}일)</p>

	{#if selected.length}
		<ul class="selected-days">
			{#each selected as key (key)}
				<li>
					<button
						type="button"
						class="ui-button is-secondary is-compact"
						aria-label={`${formatMeetupDay('dates', key)} 빼기`}
						onclick={() => toggle(key)}
					>
						<span>{formatMeetupDay('dates', key)}</span>
						<X size="0.7rem" />
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	{#each selected as key (key)}
		<input type="hidden" {name} value={key} />
	{/each}
</div>

<style lang="scss">
	@use '$style/media';

	.date-picker {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		max-width: 16rem;

		@include media.mobile {
			max-width: none;
		}
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.calendar {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.2rem;
		text-align: center;
	}

	.calendar > span {
		padding: 0.2rem 0;
		color: var(--gray-text);
		font-size: 0.7rem;
	}

	.calendar > button {
		border: 0;
		border-radius: 999rem;
		background: transparent;
		aspect-ratio: 1;
		font-size: 0.8rem;

		&:hover:not(:disabled) {
			background: var(--gray-hover);
		}

		&:disabled {
			color: var(--gray-border);
		}
	}

	.calendar > button.is-today {
		color: var(--secondary);
		font-weight: 700;
	}

	.calendar > button[aria-pressed='true'] {
		background: var(--secondary);
		color: var(--white);

		&:hover {
			background: var(--secondary-strong-hover);
		}
	}

	p {
		color: var(--gray-text);
		font-size: 0.7rem;
	}

	.selected-days {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		list-style: none;
	}
</style>
