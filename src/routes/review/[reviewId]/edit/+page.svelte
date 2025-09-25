<script lang="ts">
	import type { Course } from '$lib/course/types.js';
	import type { Professor } from '$lib/professor/types.js';
	import type { Review } from '$lib/review/types.js';
	import ReviewForm from '../../_components/ReviewForm.svelte';
	import ReviewHeader from '../../_components/ReviewHeader.svelte';

	let { data } = $props();
	let courses = $state<Course[]>(JSON.parse(data?.courses || '[]'));
	let professors = $state<Professor[]>(JSON.parse(data?.professors || '[]'));
	let review = $state<Review>(JSON.parse(data?.review || '{}'));
</script>

<ReviewHeader pageType="edit" />

<ReviewForm {professors} {courses} {review} />
