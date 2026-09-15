<script lang="ts">
	import AcademicGpaCard from './AcademicGpaCard.svelte';
	import AcademicProfileSettings from './AcademicProfileSettings.svelte';
	import AcademicProgress from './AcademicProgress.svelte';

	import type { PageData } from '../$types.js';

	let { data }: { data: PageData } = $props();

	const completedCourseIds = $derived(
		new Set(
			data.completions
				.filter((completion) => completion.status === 'passed')
				.map((completion) => completion.courseCode)
		)
	);
	const espCourses = $derived(
		data.espCourses.map((course) => ({
			...course,
			waived: data.academicProfile?.espWaivedCourseIds.includes(course.id) ?? false,
			completed: completedCourseIds.has(course.id)
		}))
	);
</script>

<AcademicProgress progress={data.degreeProgress} profile={data.academicProfile} {espCourses} />
{#if data.gpa}
	<AcademicGpaCard
		gpa={data.gpa}
		gpaByTerm={data.gpaByTerm}
		initiallyHidden={data.academicProfile?.hideGrades ?? false}
	/>
{/if}
<AcademicProfileSettings profile={data.academicProfile} espCourses={data.espCourses} />
