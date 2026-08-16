<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';

	import { buildCourseSearchModel } from './course-search-model.js';
	import CourseOfferingCard from './CourseOfferingCard.svelte';
	import CourseSearchControls from './CourseSearchControls.svelte';
	import CourseSearchResults from './CourseSearchResults.svelte';

	import type { Offering } from '$lib/types/academic.type.js';
	import type { Timetable } from '$lib/types/timetable.type.js';
	import type { CourseSearchFilter } from './course-search.js';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface Props {
		offerings: Offering[];
		timetable: Pick<Timetable, 'id' | 'offerings'>;
		offeringRestrictions: Record<string, string>;
		offeringNotices: Record<string, string>;
		filter: CourseSearchFilter;
		busy: boolean;
		pendingEnhance: SubmitFunction;
		replaceEnhance: SubmitFunction;
		removeOfferingEnhance: SubmitFunction;
		onClose: () => void;
		onClearFilter: () => void;
	}

	let {
		offerings,
		timetable,
		offeringRestrictions,
		offeringNotices,
		filter,
		busy,
		pendingEnhance,
		replaceEnhance,
		removeOfferingEnhance,
		onClose,
		onClearFilter
	}: Props = $props();
	let query = $state('');
	let category = $state('all');
	const searchModel = $derived(
		buildCourseSearchModel({
			offerings,
			selectedOfferings: timetable.offerings,
			offeringRestrictions,
			offeringNotices,
			filter,
			query,
			category
		})
	);
</script>

{#snippet offeringResult(offering: Offering)}
	{@const alreadyAdded = searchModel.selectedOfferingIds.has(offering.id)}
	{@const restriction = searchModel.restrictionFor(offering, alreadyAdded)}
	<CourseOfferingCard
		{offering}
		timetableId={timetable.id}
		actionKind={filter.kind === 'replace' ? 'replace' : alreadyAdded ? 'remove' : 'add'}
		sourceOfferingId={filter.kind === 'replace' ? filter.sourceOfferingId : null}
		restriction={restriction?.label ?? null}
		notice={searchModel.noticeFor(offering)}
		{busy}
		enhanceAction={filter.kind === 'replace'
			? replaceEnhance
			: alreadyAdded
				? removeOfferingEnhance
				: pendingEnhance}
	/>
{/snippet}

{#snippet selectedCourse(offering: Offering)}
	<CourseOfferingCard
		{offering}
		timetableId={timetable.id}
		actionKind="remove"
		{busy}
		selectedSource
		enhanceAction={removeOfferingEnhance}
	/>
{/snippet}

<aside class="module course-search-panel" aria-label="강의 찾기">
	<header>
		<span class="panel-heading">
			<Search size="0.95rem" />
			<span><b>{filter.kind === 'replace' ? '강의 교체' : '강의 찾기'}</b></span>
		</span>
		<span>
			<small>{searchModel.filteredOfferings.length}개</small>
			<button type="button" onclick={onClose} aria-label="강의 찾기 닫기" title="닫기"
				><X size="0.9rem" /></button
			>
		</span>
	</header>
	<div class="panel-body">
		<CourseSearchControls
			bind:query
			bind:category
			categories={searchModel.availableCategories}
			contextLabel={searchModel.filterLabel}
			onClearContext={onClearFilter}
		/>
		<CourseSearchResults
			{filter}
			sourceOffering={searchModel.sourceOffering}
			filteredOfferings={searchModel.filteredOfferings}
			sectionReplacements={searchModel.sectionReplacements}
			timeReplacements={searchModel.timeReplacements}
			contextLabel={searchModel.contextLabel}
			renderOffering={offeringResult}
			renderSelectedOffering={selectedCourse}
		/>
	</div>
</aside>

<style lang="scss">
	.course-search-panel {
		display: flex;
		position: sticky;
		top: 4.8rem;
		flex-direction: column;
		min-width: 0;
		max-height: calc(100vh - 5.8rem);
		max-height: calc(100dvh - 5.8rem);
		overflow: hidden;
	}
	header {
		display: flex;
		flex: 0 0 auto;
		justify-content: space-between;
		align-items: center;
		gap: 0.6rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		padding: 0.7rem 0.8rem;
	}
	header > span {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	header .panel-heading > span {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.08rem;
		min-width: 0;
	}
	header b {
		font-size: 0.82rem;
	}
	header small {
		color: var(--gray-text);
		font-size: 0.65rem;
	}
	header button {
		display: grid;
		place-items: center;
		border: 0;
		background: transparent;
		padding: 0.1rem;
		color: var(--gray-text);
	}
	header button:hover,
	header button:focus-visible {
		outline: 0;
		color: var(--text);
	}
	.panel-body {
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
	}
	@media (max-width: 900px) {
		.course-search-panel {
			position: fixed;
			top: 4.5rem;
			right: 0.5rem;
			bottom: 0.5rem;
			z-index: 40;
			box-shadow: 0 0.8rem 2.5rem color-mix(in srgb, var(--text) 18%, transparent);
			width: min(27rem, calc(100vw - 1rem));
			max-height: none;
		}
	}
</style>
