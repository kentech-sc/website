<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import type { Review } from '$lib/types/review.type.js';
	import type { Course } from '$lib/types/course.type.js';
	import type { Professor } from '$lib/types/professor.type.js';

	import CommonListBtnModule from '$components/CommonListBtnModule.svelte';

	import ReviewHeader from './_components/ReviewHeader.svelte';
	import ReviewList from './_components/ReviewList.svelte';
	import ReviewFilter from './_components/ReviewFilter.svelte';

	let { data } = $props();
	const reviews = $derived<Review[]>(data.reviews);
	const currentPage = $derived<number>(data.currentPage);
	const totalPages = $derived<number>(data.totalPages);
	const canCreateReview = $derived<boolean>(data.canCreateReview);
	const canManageCatalog = $derived<boolean>(data.canManageCatalog);
	let selectedCourse = $derived<string>(data.courseId ?? '');
	let selectedProfessor = $derived<string>(data.professorId ?? '');
	let initialized = $state(false);

	$effect(() => {
		if (!initialized) {
			initialized = true;
			return;
		}

		const params = page.url.searchParams;
		if (selectedCourse) params.set('course', selectedCourse);
		if (selectedProfessor) params.set('professor', selectedProfessor);

		const nextPath = params.toString() ? `/review?${params}` : '/review';
		const currentPath = `${page.url.pathname}${page.url.search}`;

		if (nextPath !== currentPath) {
			goto(nextPath);
		}
	});

	const courses = $derived<Course[]>(data.courses);
	const professors = $derived<Professor[]>(data.professors);
</script>

<ReviewHeader pageType="list" {canCreateReview} {canManageCatalog} />

<section class="container-col module">
	<ReviewFilter {courses} {professors} bind:selectedCourse bind:selectedProfessor />
	<ReviewList {reviews} />
	<CommonListBtnModule {currentPage} {totalPages} />
</section>
