<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	import type { DiningMenus, DiningSlot } from '$lib/types/dining.type.js';

	import { getMeal, isEmptyMeal } from '$lib/shared/dining-menu.js';

	let { menus: initialMenus }: { menus: DiningMenus | null } = $props();

	const slots: Array<{ id: DiningSlot; label: string }> = [
		{ id: 'breakfast', label: '조식' },
		{ id: 'lunch', label: '중식' },
		{ id: 'dinner', label: '석식' }
	];

	/** 지금 시각 기준으로 다음 끼니를 기본으로 연다. */
	function getCurrentSlot(now: Date = new Date()): DiningSlot {
		const hour = now.getHours();
		if (hour < 9) return 'breakfast';
		if (hour < 14) return 'lunch';
		return 'dinner';
	}

	// 서버가 내려준 오늘 메뉴를 기본으로 쓰고, 사용자가 날짜를 옮긴 뒤에만 그 결과로 덮는다.
	let movedMenus = $state<DiningMenus | null>(null);
	const menus = $derived(movedMenus ?? initialMenus);
	let selectedSlot = $state<DiningSlot>(getCurrentSlot());
	let loading = $state(false);
	let errorMessage = $state<string | null>(null);

	const meal = $derived(menus ? getMeal(menus, selectedSlot) : null);
	const dateLabel = $derived(menus ? toDateLabel(menus.date) : '');

	function toDateLabel(date: string): string {
		const year = Number(date.slice(0, 4));
		const month = Number(date.slice(4, 6));
		const day = Number(date.slice(6, 8));
		const weekday = ['일', '월', '화', '수', '목', '금', '토'][
			new Date(year, month - 1, day).getDay()
		];
		return `${month}월 ${day}일 (${weekday})`;
	}

	function shiftDate(date: string, days: number): string {
		const shifted = new Date(
			Number(date.slice(0, 4)),
			Number(date.slice(4, 6)) - 1,
			Number(date.slice(6, 8)) + days
		);
		const month = `${shifted.getMonth() + 1}`.padStart(2, '0');
		const day = `${shifted.getDate()}`.padStart(2, '0');
		return `${shifted.getFullYear()}${month}${day}`;
	}

	async function moveDate(days: number) {
		if (!menus || loading) return;

		const nextDate = shiftDate(menus.date, days);
		loading = true;
		errorMessage = null;

		try {
			const response = await fetch(`/api/dining?date=${nextDate}`);
			const body = await response.json();

			if (!response.ok) {
				errorMessage = body.message ?? '학식 정보를 불러오지 못했습니다.';
				return;
			}

			movedMenus = body as DiningMenus;
		} catch {
			errorMessage = '학식 정보를 불러오지 못했습니다.';
		} finally {
			loading = false;
		}
	}
</script>

<section class="dining module">
	<h2>
		학식
		{#if menus}
			<span class="date-nav">
				<button
					type="button"
					aria-label="이전 날짜"
					disabled={loading}
					onclick={() => moveDate(-1)}
				>
					<ChevronLeft size="1rem" />
				</button>
				<span class="date">{dateLabel}</span>
				<button type="button" aria-label="다음 날짜" disabled={loading} onclick={() => moveDate(1)}>
					<ChevronRight size="1rem" />
				</button>
			</span>
		{/if}
	</h2>

	{#if menus}
		<div class="slot-tabs" role="tablist" aria-label="식사 시간">
			{#each slots as slot (slot.id)}
				<button
					type="button"
					role="tab"
					aria-selected={selectedSlot === slot.id}
					class:selected={selectedSlot === slot.id}
					onclick={() => (selectedSlot = slot.id)}>{slot.label}</button
				>
			{/each}
		</div>

		<div class="menu">
			{#if errorMessage}
				<p class="notice">{errorMessage}</p>
			{:else if loading}
				<p class="notice">불러오는 중…</p>
			{:else if !meal || isEmptyMeal(meal)}
				<p class="notice">등록된 메뉴가 없습니다.</p>
			{:else if meal.note}
				<p class="notice">{meal.note}</p>
			{:else}
				{#each meal.sections as section (section.label ?? 'all')}
					{#if section.label}
						<h3>{section.label}</h3>
					{/if}
					<ul>
						{#each section.items as item (item)}
							<li>{item}</li>
						{/each}
					</ul>
				{/each}
				{#if meal.dessert.length}
					<h3>후식</h3>
					<ul>
						{#each meal.dessert as item (item)}
							<li>{item}</li>
						{/each}
					</ul>
				{/if}
			{/if}
		</div>
	{:else}
		<div class="menu">
			<p class="notice">학식 정보를 불러오지 못했습니다.</p>
		</div>
	{/if}
</section>

<style lang="scss">
	.dining {
		display: flex;
		flex-direction: column;
	}

	// 학사일정 카드와 머리글·이동 버튼 모양을 맞춘다.
	h2 {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.6rem;
		font-size: 1.2rem;
	}

	.date-nav {
		display: flex;
		align-items: center;
		gap: 0.3rem;

		button {
			display: flex;
			align-items: center;
			padding: 0.1rem 0.3rem;
		}
	}

	.date {
		min-width: 5.5rem;
		font-size: 0.8rem;
		text-align: center;
	}

	.slot-tabs {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));

		button {
			border-radius: 0;
			// 학사일정의 요일 줄과 높이·글자를 맞춘다. (버튼 테두리만큼 여백을 덜 준다)
			padding: 0.15rem 0;
			font-weight: bold;
			font-size: 0.7rem;

			&:first-child {
				border-start-start-radius: 0.4rem;
				border-end-start-radius: 0.4rem;
			}

			&:last-child {
				border-start-end-radius: 0.4rem;
				border-end-end-radius: 0.4rem;
			}

			&.selected {
				border-color: var(--secondary);
				background-color: var(--secondary);
				color: var(--tertiary-text);
			}
		}
	}

	.menu {
		flex: 1;
		margin-top: 0.6rem;
		// 끼니마다 항목 수가 달라 카드 높이가 출렁이지 않도록 하한을 둔다.
		min-height: 10rem;
	}

	h3 {
		margin-top: 0.4rem;
		color: var(--secondary-text);
		font-size: 0.75rem;
	}

	ul {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0 0.5rem;
		margin: 0;
		padding-left: 1rem;
	}

	li {
		font-size: 0.85rem;
	}

	.notice {
		padding-top: 1rem;
		color: var(--secondary-text);
		font-size: 0.9rem;
		text-align: center;
	}
</style>
