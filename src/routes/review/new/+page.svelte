<script lang="ts">
	import ReviewForm from '../_components/ReviewForm.svelte';
	import ReviewHeader from '../_components/ReviewHeader.svelte';

	import type { Course } from '$lib/types/course.type.js';
	import type { Professor } from '$lib/types/professor.type.js';

	let { data } = $props();
	const courses = $derived<Course[]>(data.courses);
	const professors = $derived<Professor[]>(data.professors);
</script>

<ReviewHeader pageType="new" />

<ReviewForm {professors} {courses} />
