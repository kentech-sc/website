<script lang="ts">
	import type { Review } from '$lib/review/types.js';
	import type { Course } from '$lib/course/types.js';
	import type { Professor } from '$lib/professor/types.js';
	import { goto } from '$app/navigation';

	import CommonListBtnModule from '$lib/components/CommonListBtnModule.svelte';
	import ReviewHeader from './_components/ReviewHeader.svelte';
	import ReviewList from './_components/ReviewList.svelte';
	import ReviewFilter from './_components/ReviewFilter.svelte';

	let { data } = $props();
	const reviews = $derived<Review[]>(JSON.parse(data?.reviews || '[]'));
	const fromId = $derived<string | null>(data?.fromId ?? null);
	const toId = $derived<string | null>(data?.toId ?? null);

	let selectedCourse = $state<string>('');
	let selectedProfessor = $state<string>('');

	$effect(() => {
		const querys = [];
		if (selectedCourse) querys.push(`course=${selectedCourse}`);
		if (selectedProfessor) querys.push(`professor=${selectedProfessor}`);
		goto(`/review?${querys.join('&')}`);
	});

	const courses = $derived<Course[]>(JSON.parse(data?.courses || '[]'));
	const professors = $derived<Professor[]>(JSON.parse(data?.professors || '[]'));
</script>

<ReviewHeader pageType="list" />

<section class="container-col module">
	<ReviewFilter {courses} {professors} bind:selectedCourse bind:selectedProfessor />
	<ReviewList {reviews} />
	<CommonListBtnModule pageName="review" {toId} {fromId} />
</section>
