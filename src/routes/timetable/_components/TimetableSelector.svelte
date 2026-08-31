<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import CheckCircle from '@lucide/svelte/icons/circle-check-big';
	import Plus from '@lucide/svelte/icons/plus';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';

	import type { PageData } from '../$types.js';
	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';

	let {
		data,
		selectedId,
		actualId,
		actualSelected,
		onSelect,
		pendingEnhance
	}: {
		data: PageData;
		selectedId: string | null;
		actualId: string;
		actualSelected: boolean;
		onSelect: (id: string) => void;
		pendingEnhance: SubmitFunction;
	} = $props();

	let selectedTerm = $derived(String(data.term));
</script>

<div class="module timetable-selector">
	<form method="GET" class="term-picker">
		<input name="year" type="number" min="2022" value={data.year} aria-label="연도" />
		<select name="term" bind:value={selectedTerm} aria-label="학기">
			<option value="1">1학기</option>
			<option value="2">2학기</option>
			<option value="3">하계</option>
			<option value="4">동계</option>
		</select>
		<button class="term-submit" aria-label="선택한 학기 열기" title="선택한 학기 열기">
			<ArrowRight size="0.9rem" />
		</button>
	</form>

	<nav class="timetable-tabs" aria-label="시간표 목록">
		{#if data.actualSchedule.completions.length}
			<button
				class="timetable-tab is-actual"
				class:is-active={actualSelected}
				aria-pressed={actualSelected}
				onclick={() => onSelect(actualId)}
			>
				<CheckCircle size="0.8rem" /><span>실제 수강</span>
			</button>
		{/if}
		{#each data.timetables as timetable (timetable.id)}
			<button
				class="timetable-tab"
				class:is-active={selectedId === timetable.id}
				aria-pressed={selectedId === timetable.id}
				onclick={() => onSelect(timetable.id)}
			>
				<span>{timetable.name}</span>
				{#if timetable.isConfirmed}
					<span class="confirmed-marker" aria-label="확정된 시간표">
						<CheckCircle size="0.9rem" aria-hidden="true" />
					</span>
				{/if}
				{#if Object.keys(timetable.changeReasons).length}
					<span class="review-marker" aria-label="변경 확인 필요" title="변경 확인 필요">
						<AlertTriangle size="0.85rem" aria-hidden="true" />
					</span>
				{/if}
			</button>
		{/each}
		<form method="POST" action="?/create" use:enhance={pendingEnhance} class="create-timetable">
			<input type="hidden" name="year" value={data.year} />
			<input type="hidden" name="term" value={data.term} />
			<button aria-label="시간표 추가" title="시간표 추가"><Plus size="0.9rem" /></button>
		</form>
	</nav>
</div>

<style lang="scss">
	.timetable-selector,
	.term-picker,
	.timetable-tabs,
	.timetable-tab,
	.create-timetable button {
		display: flex;
		align-items: center;
	}
	.timetable-selector {
		gap: 0.6rem;
		border-radius: 0.8rem;
		padding: 0.6rem;
		min-width: 0;
	}
	.term-picker {
		flex: 0 0 auto;
		gap: 0.4rem;
		border-right: var(--divider-border-width) solid var(--gray-border);
		padding-right: 0.6rem;
	}
	.term-picker input {
		width: 5.2rem;
	}
	.term-picker input,
	.term-picker select {
		border-color: transparent;
		background: var(--white);
	}
	.term-submit {
		display: grid;
		place-items: center;
		border-color: var(--secondary);
		border-radius: 50%;
		background: var(--secondary);
		padding: 0;
		width: 1.9rem;
		height: 1.9rem;
		color: var(--white);
	}
	.term-submit:hover:not(:disabled) {
		background: var(--secondary-strong-hover);
	}
	.timetable-tabs {
		flex: 1;
		gap: 0.4rem;
		min-width: 0;
		overflow-x: auto;
	}
	.timetable-tab,
	.create-timetable button {
		gap: 0.4rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		background: var(--white);
		padding: 0.4rem 0.6rem;
		color: var(--gray-text);
		font-size: 0.7rem;
		white-space: nowrap;
	}
	.timetable-tab.is-active {
		border-color: color-mix(in srgb, var(--secondary) 35%, var(--gray-border));
		background: color-mix(in srgb, var(--secondary) 7%, var(--white));
		color: var(--secondary);
	}
	.timetable-tab.is-actual,
	.confirmed-marker {
		color: var(--success-text);
	}
	.review-marker {
		display: flex;
		color: var(--warning-text, #946200);
	}
	.create-timetable {
		flex: 0 0 auto;
	}
	.create-timetable button {
		justify-content: center;
		border-style: dashed;
		background: transparent;
		padding: 0;
		width: 2rem;
		height: 2rem;
		touch-action: pan-y;
		color: var(--secondary);
	}
	@media (max-width: 760px) {
		.timetable-selector {
			flex-direction: column;
			align-items: stretch;
		}
		.term-picker {
			display: grid;
			grid-template-columns: 1fr 1fr auto;
			border-right: 0;
			border-bottom: var(--divider-border-width) solid var(--gray-border);
			padding-right: 0;
			padding-bottom: 0.6rem;
		}
		.term-picker input,
		.timetable-tabs {
			width: 100%;
		}
	}
</style>
