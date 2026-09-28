<script lang="ts">
	import AcademicGpaCard from './AcademicGpaCard.svelte';
	import AcademicProfileSettings from './AcademicProfileSettings.svelte';
	import AcademicProgress from './AcademicProgress.svelte';

	import type { PageData } from '../$types.js';

	let {
		records,
		espCourses,
		academicProfile,
		degreeProgress,
		gpa,
		gpaByTerm
	}: {
		records: PageData['records'];
		espCourses: PageData['espCourses'];
		academicProfile: PageData['academicProfile'];
		degreeProgress: PageData['degreeProgress'];
		gpa: PageData['gpa'];
		gpaByTerm: PageData['gpaByTerm'];
	} = $props();

	const completedCourseIds = $derived(
		new Set(
			records.filter((record) => record.status === 'passed').map((record) => record.courseCode)
		)
	);
	const annotatedEspCourses = $derived(
		espCourses.map((course) => ({
			...course,
			waived: academicProfile?.espWaivedCourseIds.includes(course.id) ?? false,
			completed: completedCourseIds.has(course.id)
		}))
	);
</script>

<AcademicProgress
	progress={degreeProgress}
	profile={academicProfile}
	espCourses={annotatedEspCourses}
/>
{#if gpa}
	<AcademicGpaCard {gpa} {gpaByTerm} initiallyHidden={academicProfile?.hideGrades ?? false} />
{/if}
<AcademicProfileSettings profile={academicProfile} {espCourses} />
