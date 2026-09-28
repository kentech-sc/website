<script lang="ts">
	import AcademicCreditSummary from './AcademicCreditSummary.svelte';
	import AcademicProfileSetupCallout from './AcademicProfileSetupCallout.svelte';
	import DegreeRequirementDetails from './DegreeRequirementDetails.svelte';

	import type { PageData } from '../$types.js';

	let {
		progress,
		profile,
		espCourses
	}: {
		progress: PageData['degreeProgress'];
		profile: PageData['academicProfile'];
		espCourses: Array<{ id: string; name: string; waived: boolean; completed: boolean }>;
	} = $props();
</script>

{#if progress}
	<AcademicCreditSummary {progress} {profile} />
	<DegreeRequirementDetails {progress} {espCourses} />
{:else}
	<AcademicProfileSetupCallout />
{/if}
