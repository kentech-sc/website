<script lang="ts">
	import type { Course } from '$lib/types/course.type.js';
	import type { Professor } from '$lib/types/professor.type.js';
	import type { Review } from '$lib/types/review.type.js';

	import ReviewForm from '../../_components/ReviewForm.svelte';
	import ReviewHeader from '../../_components/ReviewHeader.svelte';

	let { data } = $props();
	const courses = $derived<Course[]>(data.courses);
	const professors = $derived<Professor[]>(data.professors);
	const review = $derived<Review>(data.review);
</script>

<ReviewHeader pageType="edit" />

{#key review._id}
	<ReviewForm {professors} {courses} {review} />
{/key}
