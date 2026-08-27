<script lang="ts">
	import Search from '@lucide/svelte/icons/search';

	import type { Offering } from '$lib/types/academic.type.js';
	import type { CourseSearchFilter } from './course-search.js';
	import type { Snippet } from 'svelte';

	let {
		filter,
		sourceOffering,
		filteredOfferings,
		sectionReplacements,
		timeReplacements,
		contextLabel,
		renderOffering,
		renderSelectedOffering
	}: {
		filter: CourseSearchFilter;
		sourceOffering: Offering | null;
		filteredOfferings: Offering[];
		sectionReplacements: Offering[];
		timeReplacements: Offering[];
		contextLabel: string | null;
		renderOffering: Snippet<[Offering]>;
		renderSelectedOffering: Snippet<[Offering]>;
	} = $props();
</script>

<div class="course-search-results">
	{#if filter.kind === 'replace' && sourceOffering}
		<section class="selected-offering" aria-label="선택한 강의">
			{@render renderSelectedOffering(sourceOffering)}
		</section>
		<section aria-labelledby="section-results-title">
			<header class="result-group-heading">
				<span><b id="section-results-title">다른 분반</b><small>같은 과목</small></span>
				<small>{sectionReplacements.length}개</small>
			</header>
			{#each sectionReplacements as offering (offering.id)}
				{@render renderOffering(offering)}
			{/each}
			{#if !sectionReplacements.length}<p class="empty-group">다른 분반이 없습니다.</p>{/if}
		</section>
		<section aria-labelledby="time-results-title">
			<header class="result-group-heading">
				<span><b id="time-results-title">이 시간대 강의</b><small>{contextLabel}</small></span>
				<small>{timeReplacements.length}개</small>
			</header>
			{#each timeReplacements as offering (offering.id)}
				{@render renderOffering(offering)}
			{/each}
			{#if !timeReplacements.length}<p class="empty-group">교체할 수 있는 강의가 없습니다.</p>{/if}
		</section>
	{:else if filter.kind === 'slot'}
		<section aria-labelledby="slot-results-title">
			<header class="result-group-heading">
				<span><b id="slot-results-title">이 시간대 강의</b><small>{contextLabel}</small></span>
				<small>{filteredOfferings.length}개</small>
			</header>
			{#each filteredOfferings as offering (offering.id)}
				{@render renderOffering(offering)}
			{/each}
		</section>
	{:else}
		{#each filteredOfferings as offering (offering.id)}
			{@render renderOffering(offering)}
		{/each}
	{/if}

	{#if filter.kind !== 'replace' && !filteredOfferings.length}
		<div class="empty-results">
			<Search size="1.2rem" />
			<p>조건에 맞는 강의가 없습니다.</p>
		</div>
	{/if}
</div>

<style lang="scss">
	.course-search-results {
		flex: 1 1 auto;
		padding-bottom: env(safe-area-inset-bottom, 0);
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	.selected-offering {
		border-bottom: 0.3rem solid var(--gray-bg);
	}
	.result-group-heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.4rem;
		background: color-mix(in srgb, var(--gray-bg) 72%, var(--white));
		padding: 0.4rem 0.6rem;
	}
	.result-group-heading > span {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
	}
	.result-group-heading b {
		font-size: 0.7rem;
	}
	.result-group-heading small {
		color: var(--gray-text);
		font-size: 0.6rem;
	}
	.empty-group {
		margin: 0;
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding: 0.8rem 0.6rem;
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.empty-results {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
		padding: 2rem;
		color: var(--gray-text);
		text-align: center;
	}
	.empty-results p {
		margin: 0;
		font-size: 0.7rem;
	}
</style>
