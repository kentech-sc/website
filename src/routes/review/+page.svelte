<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	import ReviewFilter from './_components/ReviewFilter.svelte';
	import ReviewHeader from './_components/ReviewHeader.svelte';
	import ReviewList from './_components/ReviewList.svelte';

	import type { Course } from '$lib/types/course.type.js';
	import type { Professor } from '$lib/types/professor.type.js';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data } = $props();
	const reviewPage = $derived(data.reviewPage);
	const canCreateReview = $derived<boolean>(data.canCreateReview);
	const canManageCatalog = $derived<boolean>(data.canManageCatalog);
	let selectedCourse = $derived<string>(data.courseId ?? '');
	let selectedProfessor = $derived<string>(data.professorId ?? '');

	$effect(() => {
		const params = new SvelteURLSearchParams(page.url.searchParams);

		params.set('course', selectedCourse);
		params.set('professor', selectedProfessor);

		const currentPath = `${page.url.pathname}${page.url.search}`;
		const nextPath = params.toString() ? `/review?${params}` : '/review';

		if (nextPath !== currentPath) {
			goto(nextPath);
		}
	});

	const courses = $derived<Course[]>(data.courses);
	const professors = $derived<Professor[]>(data.professors);
</script>

<ReviewHeader pageType="list" {canCreateReview} {canManageCatalog} />

<ReviewFilter {courses} {professors} bind:selectedCourse bind:selectedProfessor />

<ReviewList {reviewPage} />
