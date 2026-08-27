<script lang="ts">
	import type { Course } from '$lib/types/course.type.js';

	import CommonLabel from '$components/CommonLabel.svelte';

	let {
		courses,
		professors,
		courseIdsByProfessor,
		selectedCourse = $bindable<string>(),
		selectedProfessor = $bindable<string>()
	} = $props();

	// 교수를 고르면 그 교수가 담당한 적 있는 강의만 남긴다.
	const availableCourses = $derived.by(() => {
		if (!selectedProfessor) return courses;
		const courseIds = new Set(courseIdsByProfessor[selectedProfessor] ?? []);
		return courses.filter((course: Course) => courseIds.has(course.id));
	});

	// 교수를 바꿔 기존 선택 강의가 목록에서 사라지면 강의 선택을 비운다.
	$effect(() => {
		if (selectedCourse && !availableCourses.some((course: Course) => course.id === selectedCourse))
			selectedCourse = '';
	});
</script>

<div class="filter">
	<CommonLabel labelFor="professor" labelString="교수">
		<select id="professor" bind:value={selectedProfessor}>
			<option value="">전체</option>
			{#each professors as professor (professor.id)}
				<option value={professor.id}>{professor.name} 교수님</option>
			{/each}
		</select>
	</CommonLabel>

	<CommonLabel labelFor="course" labelString="강의">
		<select id="course" bind:value={selectedCourse}>
			<option value="">전체</option>
			{#each availableCourses as course (course.id)}
				<option value={course.id}>[{course.id}] {course.name}</option>
			{/each}
		</select>
	</CommonLabel>
</div>

<style lang="scss">
	.filter {
		display: flex;

		gap: 1rem;
		margin-bottom: 1rem;
		width: 100%;

		// 옵션 글자 길이와 무관하게 두 칸이 항상 절반씩 차지하도록 고정한다.
		& > :global(*) {
			flex: 1 1 0;
			min-width: 0;
		}

		select {
			width: 100%;
		}
	}
</style>
