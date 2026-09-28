<script lang="ts">
	import type { ReviewableOffering } from '$lib/types/academic.type.js';

	import FormField from '$components/FormField.svelte';
	let { reviewableOfferings }: { reviewableOfferings: ReviewableOffering[] } = $props();
	let offeringQuery = $state('');
	let yearFilter = $state('');
	let termFilter = $state('');
	const availableYears = $derived(
		[...new Set(reviewableOfferings.map((offering) => offering.year))].sort((a, b) => b - a)
	);
	const availableTerms = $derived(
		[...new Set(reviewableOfferings.map((offering) => offering.term))].sort((a, b) => a - b)
	);
	/** 분반은 개설강좌를 구분하지 않는다 — 같은 강의·학기·교수진이면 대표 개설강좌 하나로 합친다. */
	function offeringGroupKey(offering: ReviewableOffering): string {
		const professorIds = offering.professors
			.map((professor) => professor.id)
			.sort()
			.join(',');
		return `${offering.courseId}|${offering.year}|${offering.term}|${professorIds}`;
	}
	const groupedOfferings = $derived([
		...new Map(
			reviewableOfferings.map((offering) => [offeringGroupKey(offering), offering])
		).values()
	]);
	const filteredOfferings = $derived(
		groupedOfferings
			.filter((offering) => !yearFilter || offering.year === Number(yearFilter))
			.filter((offering) => !termFilter || offering.term === Number(termFilter))
			.filter((offering) =>
				`${offering.courseId} ${offering.courseName} ${offering.subtitle ?? ''} ${offering.professors.map((professor) => professor.name).join(' ')}`
					.toLowerCase()
					.includes(offeringQuery.trim().toLowerCase())
			)
	);
	function termLabel(term: number): string {
		return ['1학기', '2학기', '하계', '동계'][term - 1] ?? `${term}학기`;
	}

	function offeringLabel(offering: ReviewableOffering): string {
		const professors = offering.professors.map((professor) => professor.name).join(', ');
		return `[${offering.courseId}] ${offering.courseName} · ${offering.year}-${offering.term} · ${professors || '담당 교수 개별 배정'}`;
	}
</script>

<div class="offering-filter-row">
	<FormField inputId="yearFilter" label="연도">
		<select id="yearFilter" bind:value={yearFilter}>
			<option value="">전체</option>
			{#each availableYears as year (year)}
				<option value={year}>{year}년</option>
			{/each}
		</select>
	</FormField>
	<FormField inputId="termFilter" label="학기">
		<select id="termFilter" bind:value={termFilter}>
			<option value="">전체</option>
			{#each availableTerms as term (term)}
				<option value={term}>{termLabel(term)}</option>
			{/each}
		</select>
	</FormField>
	<FormField inputId="offeringQuery" label="개설 강의 검색">
		<input
			id="offeringQuery"
			type="search"
			placeholder="강의 코드 또는 교수명"
			bind:value={offeringQuery}
		/>
	</FormField>
</div>
<div class="offering-picker">
	<FormField inputId="offeringId" label="평가할 개설 강의">
		<select id="offeringId" name="offeringId" required>
			<option value="">선택</option>
			{#each filteredOfferings as offering (offering.id)}
				<option value={offering.id}>{offeringLabel(offering)}</option>
			{/each}
		</select>
	</FormField>
</div>

<style lang="scss">
	@use '$style/media';

	.offering-filter-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr);
		gap: 1rem;
		width: 100%;
		@include media.mobile {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		}
	}
	.offering-picker {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
		width: 100%;
	}
</style>
