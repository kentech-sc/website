<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Repeat2 from '@lucide/svelte/icons/repeat-2';
	import Search from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';

	import type { Offering } from '$lib/types/academic.type.js';
	import type { Timetable } from '$lib/types/timetable.type.js';
	import type { CourseSearchFilter } from './course-search.js';
	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	interface Props {
		offerings: Offering[];
		timetable: Pick<Timetable, 'id' | 'offerings'>;
		offeringRestrictions: Record<string, string>;
		offeringNotices: Record<string, string>;
		filter: CourseSearchFilter;
		busy: boolean;
		pendingEnhance: SubmitFunction;
		addEnhance: SubmitFunction;
		replaceEnhance: SubmitFunction;
		cancelSelectionEnhance: SubmitFunction;
		onclose: () => void;
		onclearfilter: () => void;
		courseColor: (category: string | null) => string;
		scheduleText: (offering: Offering) => string;
	}

	let {
		offerings,
		timetable,
		offeringRestrictions,
		offeringNotices,
		filter,
		busy,
		pendingEnhance,
		addEnhance,
		replaceEnhance,
		cancelSelectionEnhance,
		onclose,
		onclearfilter,
		courseColor,
		scheduleText
	}: Props = $props();
	let query = $state('');
	let category = $state('all');
	let academicCareer = $state<'all' | 'undergraduate' | 'graduate'>('all');

	const weekdays = ['월', '화', '수', '목', '금'];
	const selectedOfferingIds = $derived(new Set(timetable.offerings.map((offering) => offering.id)));
	const availableCategories = $derived(
		[...new Set(offerings.map((offering) => offering.category).filter(Boolean))].sort()
	);
	const filteredOfferings = $derived(
		offerings
			.filter((offering) => matchesFilter(offering))
			.filter((offering) => {
				const searchText =
					`${offering.courseId} ${offering.courseName} ${offering.subtitle ?? ''} ${offering.professors.map((professor) => professor.name).join(' ')}`.toLowerCase();
				return (
					searchText.includes(query.trim().toLowerCase()) &&
					(academicCareer === 'all' || offering.academicCareer === academicCareer) &&
					(category === 'all' || offering.category === category)
				);
			})
			.sort((a, b) => resultRank(a) - resultRank(b))
	);
	const availableOfferings = $derived(
		filteredOfferings.filter(
			(offering) => !offeringRestriction(offering, selectedOfferingIds.has(offering.id))
		)
	);
	const unavailableOfferings = $derived(
		filteredOfferings.filter((offering) =>
			Boolean(offeringRestriction(offering, selectedOfferingIds.has(offering.id)))
		)
	);
	const sectionAlternatives = $derived(
		availableOfferings.filter((offering) => replacementKind(offering) === 'section')
	);
	const timeslotAlternatives = $derived(
		availableOfferings.filter((offering) => replacementKind(offering) === 'timeslot')
	);
	const selectedSourceOffering = $derived(selectedReplacementSource());

	function formatTime(minutes: number): string {
		return `${Math.floor(minutes / 60)
			.toString()
			.padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
	}
	function selectedReplacementSource(): Offering | null {
		if (filter.kind !== 'replace') return null;
		return (
			timetable.offerings.find(
				(selectedOffering) => selectedOffering.id === filter.sourceOfferingId
			) ?? null
		);
	}
	function matchesFilter(offering: Offering): boolean {
		if (filter.kind === 'all') return true;
		if (filter.kind === 'unscheduled')
			return !offering.meetings.some((meeting) => meeting.weekday >= 1 && meeting.weekday <= 5);
		if (filter.kind === 'day')
			return offering.meetings.some((meeting) => meeting.weekday === filter.weekday);
		if (filter.kind === 'replace') {
			const source = selectedReplacementSource();
			if (offering.id === filter.sourceOfferingId) return false;
			return (
				(source !== null && offering.courseId === source.courseId) ||
				offering.meetings.some(
					(meeting) =>
						meeting.weekday === filter.weekday &&
						meeting.startsAt < filter.endsAt &&
						filter.startsAt < meeting.endsAt
				)
			);
		}
		return offering.meetings.some(
			(meeting) =>
				meeting.weekday === filter.weekday &&
				meeting.startsAt < filter.minute + 30 &&
				filter.minute < meeting.endsAt
		);
	}
	function panelTitle(): string {
		const source = selectedReplacementSource();
		return source ? `${source.courseName} 교체` : '강의 찾기';
	}
	function searchContextLabel(): string | null {
		if (filter.kind !== 'slot' && filter.kind !== 'replace') return null;
		const startsAt = filter.kind === 'slot' ? filter.minute : filter.startsAt;
		const endsAt = filter.kind === 'slot' ? filter.minute + 30 : filter.endsAt;
		return `${weekdays[filter.weekday - 1]} ${formatTime(startsAt)}–${formatTime(endsAt)} 기준`;
	}
	function filterLabel(): string | null {
		if (filter.kind === 'all') return null;
		if (filter.kind === 'unscheduled') return '시간 미정';
		if (filter.kind === 'day') return `${weekdays[filter.weekday - 1]}요일`;
		return null;
	}
	function replacementSource(offering: Offering): Offering | null {
		if (filter.kind !== 'replace' || offering.id === filter.sourceOfferingId) return null;
		return selectedReplacementSource();
	}
	type ReplacementKind = 'section' | 'timeslot';
	function replacementKind(offering: Offering): ReplacementKind | null {
		const source = replacementSource(offering);
		if (!source) return null;
		return offering.courseId === source.courseId ? 'section' : 'timeslot';
	}
	function fitsInsideReplacementWindow(offering: Offering): boolean {
		if (filter.kind !== 'replace') return false;
		return offering.meetings.some(
			(meeting) =>
				meeting.weekday === filter.weekday &&
				filter.startsAt <= meeting.startsAt &&
				meeting.endsAt <= filter.endsAt
		);
	}
	function hasConflict(offering: Offering, ignoredOfferingId?: string): boolean {
		return offering.meetings.some((candidate) =>
			timetable.offerings.some(
				(selectedOffering) =>
					selectedOffering.id !== offering.id &&
					selectedOffering.id !== ignoredOfferingId &&
					selectedOffering.meetings.some(
						(meeting) =>
							meeting.weekday === candidate.weekday &&
							meeting.startsAt < candidate.endsAt &&
							candidate.startsAt < meeting.endsAt
					)
			)
		);
	}
	type OfferingRestriction = { label: string; order: number };
	function offeringRestriction(
		offering: Offering,
		alreadyAdded: boolean
	): OfferingRestriction | null {
		if (alreadyAdded) return null;
		const replacement = replacementSource(offering);
		if (!replacement && timetable.offerings.some((item) => item.courseId === offering.courseId))
			return { label: '대체 분반', order: 0 };
		if (hasConflict(offering, replacement?.id)) return { label: '시간 겹침', order: 1 };
		const catalogReason = offeringRestrictions[offering.id];
		if (catalogReason) return { label: catalogReason, order: 2 };
		return null;
	}
	/** 담을 수는 있지만 알아두면 좋은 정보 (예: 이미 이수한 과목의 재수강). */
	function offeringNotice(offering: Offering): string | null {
		return offeringNotices[offering.id] ?? null;
	}
	function resultRank(offering: Offering): number {
		if (selectedOfferingIds.has(offering.id)) return 0;
		const restriction = offeringRestriction(offering, false);
		if (restriction) return restriction.order + 10;
		const replacement = replacementKind(offering);
		if (replacement === 'section') return offeringNotice(offering) ? 2 : 1;
		const careerRank = offering.academicCareer === 'graduate' ? 2 : 1;
		const windowRank =
			replacement === 'timeslot' ? (fitsInsideReplacementWindow(offering) ? 2 : 4) : 0;
		return careerRank + windowRank + (offeringNotice(offering) ? 4 : 0);
	}
</script>

{#snippet offeringResult(offering: Offering)}
	{@const alreadyAdded = selectedOfferingIds.has(offering.id)}
	{@const selectedSource = offering.id === selectedSourceOffering?.id}
	{@const replacement = replacementSource(offering)}
	{@const restriction = offeringRestriction(offering, alreadyAdded)}
	{@const notice = offeringNotice(offering)}
	<article class:added={alreadyAdded} class:unavailable={Boolean(restriction)}>
		<i style={`background: ${courseColor(offering.category)}`}></i>
		<div class="offering-copy">
			<div class="offering-tags">
				{#if offering.academicCareer === 'graduate'}<span class="graduate-label">대학원</span>{/if}
				<span>{offering.category ?? '기타'}</span><span>{offering.courseId}</span>
				{#if restriction}<span class="unavailable-label">{restriction.label}</span>
				{:else if notice}<span class="notice-label">{notice}</span>{/if}
			</div>
			<strong>
				{offering.courseName}
				{#if offering.subtitle}<small>{offering.subtitle}</small>{/if}
			</strong>
			<p>{scheduleText(offering)}</p>
			<p>
				{offering.professors.map((professor) => professor.name).join(', ') || '교수 미정'} ·
				{offering.section}분반 · {offering.creditType === 'pass' ? 'P' : `${offering.credits}학점`}
			</p>
		</div>
		<div class="offering-actions">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- query string is appended to a resolved route -->
			<a href={`${resolve('/review')}?course=${encodeURIComponent(offering.courseId)}`}>강의평가</a>
			<form
				method="POST"
				action={alreadyAdded ? '?/removeItem' : replacement ? '?/replace' : '?/add'}
				use:enhance={selectedSource
					? cancelSelectionEnhance
					: alreadyAdded
						? pendingEnhance
						: replacement
							? replaceEnhance
							: addEnhance}
			>
				<input type="hidden" name="timetableId" value={timetable.id} />
				{#if replacement}
					<input type="hidden" name="fromOfferingId" value={replacement.id} />
					<input type="hidden" name="toOfferingId" value={offering.id} />
				{:else}
					<input type="hidden" name="offeringId" value={offering.id} />
				{/if}
				<button
					class:add-offering={!alreadyAdded}
					class:remove-offering={alreadyAdded}
					disabled={busy || Boolean(restriction)}
				>
					{#if selectedSource}<X size="0.82rem" />취소{:else if alreadyAdded}<X
							size="0.82rem"
						/>제거{:else if replacement}<Repeat2 size="0.82rem" />교체{:else}<Plus
							size="0.82rem"
						/>추가{/if}
				</button>
			</form>
		</div>
	</article>
{/snippet}

<aside class="module course-search-panel" aria-label="강의 찾기">
	<header>
		<span class="panel-heading">
			<Search size="0.95rem" />
			<span><b>{panelTitle()}</b></span>
		</span>
		<span>
			<small>{filteredOfferings.length}개</small>
			<button type="button" onclick={onclose} aria-label="강의 찾기 닫기" title="닫기"
				><X size="0.9rem" /></button
			>
		</span>
	</header>
	<div class="panel-body">
		<div class="browser-controls">
			<label class="course-search"
				><Search size="0.95rem" /><input
					type="search"
					bind:value={query}
					placeholder="예: EF, 물리, 교수명"
					aria-label="강의 검색"
				/></label
			>
		</div>
		<div class="search-filter-tags" aria-label="강의 검색 조건">
			{#if filterLabel()}<button
					class="filter-tag active filter-reset"
					type="button"
					onclick={onclearfilter}
					title="시간 조건 지우기"
					><span>{filterLabel()}</span><X size="0.7rem" aria-hidden="true" /></button
				>{/if}
			<button
				class="filter-tag"
				class:active={academicCareer === 'all'}
				onclick={() => (academicCareer = 'all')}>전체 과정</button
			>
			<button
				class="filter-tag"
				class:active={academicCareer === 'undergraduate'}
				onclick={() => (academicCareer = 'undergraduate')}>학부</button
			>
			<button
				class="filter-tag"
				class:active={academicCareer === 'graduate'}
				onclick={() => (academicCareer = 'graduate')}>대학원</button
			>
			<button
				class="filter-tag"
				class:active={category === 'all'}
				onclick={() => (category = 'all')}>전체 영역</button
			>
			{#each availableCategories as item (item)}
				<button
					class="filter-tag"
					class:active={category === item}
					onclick={() => (category = item!)}>{item}</button
				>
			{/each}
		</div>
		<div class="offering-list">
			{#if selectedSourceOffering}
				<section class="selected-result" aria-labelledby="selected-offering-title">
					<div class="result-group-heading selected-heading">
						<span
							><b id="selected-offering-title">선택한 강의</b><small>시간표에 추가됨</small></span
						>
					</div>
					{@render offeringResult(selectedSourceOffering)}
				</section>
			{/if}
			{#if filter.kind === 'replace'}
				{#if sectionAlternatives.length}
					<section class="result-group" aria-labelledby="section-alternatives-title">
						<div class="result-group-heading">
							<span><b id="section-alternatives-title">다른 분반</b><small>같은 과목</small></span>
							<small>{sectionAlternatives.length}개</small>
						</div>
						{#each sectionAlternatives as offering (offering.id)}
							{@render offeringResult(offering)}
						{/each}
					</section>
				{/if}
				{#if timeslotAlternatives.length}
					<section class="result-group" aria-labelledby="timeslot-alternatives-title">
						<div class="result-group-heading">
							<span
								><b id="timeslot-alternatives-title">이 시간대 강의</b><small
									>{searchContextLabel()}</small
								></span
							>
							<small>{timeslotAlternatives.length}개</small>
						</div>
						{#each timeslotAlternatives as offering (offering.id)}
							{@render offeringResult(offering)}
						{/each}
					</section>
				{/if}
			{:else if filter.kind === 'slot'}
				<section class="result-group" aria-labelledby="slot-results-title">
					<div class="result-group-heading">
						<span
							><b id="slot-results-title">이 시간대 강의</b><small>{searchContextLabel()}</small
							></span
						>
						<small>{availableOfferings.length}개</small>
					</div>
					{#each availableOfferings as offering (offering.id)}
						{@render offeringResult(offering)}
					{/each}
				</section>
			{:else}
				{#each availableOfferings as offering (offering.id)}
					{@render offeringResult(offering)}
				{/each}
			{/if}
			{#if unavailableOfferings.length}
				<details class="unavailable-results">
					<summary>추가할 수 없는 강의 {unavailableOfferings.length}개</summary>
					{#each unavailableOfferings as offering (offering.id)}
						{@render offeringResult(offering)}
					{/each}
				</details>
			{/if}
			{#if !filteredOfferings.length}
				<div class="empty-list">
					<Search size="1.2rem" />
					<p>조건에 맞는 강의가 없습니다.</p>
				</div>
			{/if}
		</div>
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
	.browser-controls {
		display: flex;
		flex: 0 0 auto;
		padding: 0.65rem 0.65rem 0.45rem;
	}
	.course-search {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 0.35rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.5rem;
		padding-left: 0.5rem;
		min-width: 0;
		color: var(--gray-text);
	}
	.course-search:focus-within {
		border-color: var(--secondary);
	}
	.course-search input {
		border: 0;
		width: 100%;
		min-width: 0;
	}
	.search-filter-tags {
		display: flex;
		flex: 0 0 auto;
		flex-wrap: wrap;
		gap: 0.3rem;
		padding: 0 0.65rem 0.65rem;
	}
	.filter-tag {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		border-width: var(--control-border-width);
		border-radius: 999px;
		background: var(--white);
		padding: 0.28rem 0.5rem;
		color: var(--gray-text);
		font-size: 0.63rem;
		line-height: 1;
	}
	.filter-reset {
		gap: 0.22rem;
		padding-right: 0.38rem;
	}
	.filter-tag.active {
		border-color: var(--secondary);
		background: color-mix(in srgb, var(--secondary) 8%, white);
		color: var(--secondary);
	}
	.offering-list {
		flex: 1 1 auto;
		padding-bottom: env(safe-area-inset-bottom, 0);
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	.offering-list article {
		display: grid;
		grid-template-columns: 3px minmax(0, 1fr) auto;
		gap: 0.5rem;
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding: 0.6rem 0.65rem;
	}
	.offering-list article > i {
		border-radius: 999px;
		width: 3px;
	}
	.offering-list article.added {
		background: var(--success-bg);
	}
	.offering-list article.unavailable {
		opacity: 0.68;
	}
	.result-group + .result-group {
		border-top: var(--divider-border-width) solid var(--gray-border);
	}
	.selected-result {
		box-shadow: 0 0.3rem 0.65rem color-mix(in srgb, var(--text) 7%, transparent);
		border-bottom: var(--control-border-width) solid
			color-mix(in srgb, var(--secondary) 28%, var(--gray-border));
		background: var(--white);
	}
	.selected-heading {
		background: color-mix(in srgb, var(--secondary) 7%, var(--white));
	}
	.selected-heading b {
		color: var(--secondary);
	}
	.result-group-heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		background: color-mix(in srgb, var(--gray-bg) 72%, var(--white));
		padding: 0.48rem 0.65rem;
	}
	.result-group-heading > span {
		display: flex;
		align-items: baseline;
		gap: 0.35rem;
	}
	.result-group-heading b {
		font-size: 0.66rem;
	}
	.result-group-heading small {
		color: var(--gray-text);
		font-size: 0.57rem;
	}
	.offering-copy {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.offering-copy > strong {
		display: flex;
		flex-direction: column;
		margin: 0.15rem 0;
		font-size: 0.74rem;
	}
	.offering-copy > strong small {
		color: var(--gray-text);
		font-weight: 400;
		font-size: 0.62rem;
	}
	.offering-copy p {
		margin: 0.05rem 0;
		color: var(--gray-text);
		font-size: 0.61rem;
		line-height: 1.35;
	}
	.offering-tags {
		display: flex;
		gap: 0.22rem;
	}
	.offering-tags span {
		border-radius: 0.2rem;
		background: var(--gray-bg);
		padding: 0.12rem 0.25rem;
		color: var(--gray-text);
		font-size: 0.55rem;
	}
	.offering-tags .unavailable-label {
		background: var(--error-bg);
		color: var(--error-text);
	}
	.offering-tags .graduate-label {
		background: color-mix(in srgb, var(--secondary) 10%, white);
		color: var(--secondary);
	}
	// 차단이 아니라 안내이므로 경고색이 아닌 성공색으로 구분한다.
	.offering-tags .notice-label {
		background: var(--success-bg);
		color: var(--success-text);
	}
	.offering-actions {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-end;
		gap: 0.25rem;
	}
	.offering-actions a {
		color: var(--gray-text);
		font-size: 0.58rem;
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, currentColor 55%, transparent);
		text-underline-offset: 0.16rem;
	}
	.offering-actions button {
		display: flex;
		align-items: center;
		gap: 0.18rem;
		padding: 0.22rem 0.42rem;
		font-size: 0.62rem;
	}
	.add-offering {
		border-color: var(--secondary);
		background: var(--secondary);
		color: var(--white);

		&:hover:not(:disabled) {
			background: var(--secondary-strong-hover);
		}
	}
	.remove-offering {
		border-color: color-mix(in srgb, var(--error-text) 35%, var(--gray-border));
		background: var(--white);
		color: var(--error-text);
	}
	.unavailable-results {
		border-top: var(--divider-border-width) solid var(--gray-border);
	}
	.unavailable-results summary {
		cursor: pointer;
		background: var(--gray-bg);
		padding: 0.55rem 0.65rem;
		color: var(--gray-text);
		font-weight: 650;
		font-size: 0.63rem;
		list-style-position: inside;
	}
	.empty-list {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 2rem;
		color: var(--gray-text);
		text-align: center;
	}
	.empty-list p {
		margin: 0;
		font-size: 0.72rem;
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
