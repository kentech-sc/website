<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	import type { DiningSlot } from '$lib/types/dining.type.js';

	// 레이아웃 확정용 껍데기. 실제 메뉴 연결은 학식 단계에서 붙인다.
	const slots: Array<{ id: DiningSlot; label: string }> = [
		{ id: 'breakfast', label: '조식' },
		{ id: 'lunch', label: '중식' },
		{ id: 'dinner', label: '석식' }
	];

	let selectedSlot = $state<DiningSlot>('lunch');
</script>

<section class="dining module">
	<h2>학식</h2>

	<div class="date-nav container">
		<button type="button" aria-label="이전 날짜"><ChevronLeft size="1.1rem" /></button>
		<span class="date">날짜</span>
		<button type="button" aria-label="다음 날짜"><ChevronRight size="1.1rem" /></button>
	</div>

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

	<div class="menu container-col">
		<span>메뉴 표시 영역</span>
	</div>
</section>

<style lang="scss">
	.dining {
		display: flex;
		flex-direction: column;
	}

	h2 {
		margin-bottom: 0.6rem;
		font-size: 1.2rem;
	}

	.date-nav {
		justify-content: center;
		gap: 1rem;

		button {
			display: flex;
			align-items: center;
			padding: 0.2rem 0.5rem;
		}
	}

	.date {
		font-size: 0.95rem;
	}

	.slot-tabs {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		margin-top: 0.6rem;

		button {
			border-radius: 0;
			font-size: 0.9rem;

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
		justify-content: center;
		// 달력 카드와 높이를 맞추기 위한 임시 값.
		min-height: 10rem;
		color: var(--secondary-text);
		font-size: 0.9rem;
	}
</style>
