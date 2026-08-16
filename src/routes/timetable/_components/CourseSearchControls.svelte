<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';

	let {
		query = $bindable(''),
		category = $bindable('all'),
		categories,
		contextLabel,
		onClearContext
	}: {
		query?: string;
		category?: string;
		categories: string[];
		contextLabel: string | null;
		onClearContext: () => void;
	} = $props();
</script>

<div class="course-search-controls">
	<label class="course-query-field">
		<Search size="1rem" />
		<input
			type="search"
			bind:value={query}
			placeholder="예: EF, 물리, 교수명"
			aria-label="강의 검색"
		/>
	</label>
	<div class="course-category-filters" aria-label="강의 검색 조건">
		{#if contextLabel}
			<button
				class="filter-chip is-active is-reset"
				type="button"
				onclick={onClearContext}
				title="시간 조건 지우기"
				><span>{contextLabel}</span><X size="0.7rem" aria-hidden="true" /></button
			>
		{/if}
		<button
			class="filter-chip"
			class:is-active={category === 'all'}
			onclick={() => (category = 'all')}>전체 영역</button
		>
		{#each categories as item (item)}
			<button
				class="filter-chip"
				class:is-active={category === item}
				onclick={() => (category = item)}>{item}</button
			>
		{/each}
	</div>
</div>

<style lang="scss">
	.course-search-controls {
		display: grid;
		gap: 0.4rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		padding: 0.6rem;
	}
	.course-query-field {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		padding-left: 0.4rem;
		color: var(--gray-text);
	}
	.course-query-field:focus-within {
		border-color: var(--secondary);
	}
	.course-query-field input {
		flex: 1;
		border: 0;
		min-width: 0;
	}
	.course-category-filters {
		display: flex;
		flex-flow: wrap;
		gap: 0.2rem;
	}
	.filter-chip {
		flex: 0 0 auto;
		border-color: var(--gray-border);
		border-radius: 999px;
		background: var(--white);
		padding: 0.2rem 0.4rem;
		color: var(--gray-text);
		font-size: 0.6rem;
		white-space: nowrap;
	}
	.filter-chip.is-active {
		border-color: var(--secondary);
		background: var(--secondary-bg);
		color: var(--secondary);
	}
	.filter-chip.is-reset {
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}
</style>
