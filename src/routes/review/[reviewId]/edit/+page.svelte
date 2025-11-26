<script lang="ts">
	import type { Course } from '$lib/types/course.type.js';
	import type { Professor } from '$lib/types/prof.type.js';
	import type { Review } from '$lib/types/review.type.js';

	import ReviewForm from '../../_components/ReviewForm.svelte';
	import ReviewHeader from '../../_components/ReviewHeader.svelte';

	let { data } = $props();
	let courses = $state<Course[]>(JSON.parse(data?.courses || '[]'));
	let professors = $state<Professor[]>(JSON.parse(data?.professors || '[]'));
	let review = $state<Review>(JSON.parse(data?.review || '{}'));
</script>

<ReviewHeader pageType="edit" />

<ReviewForm {professors} {courses} {review} />
