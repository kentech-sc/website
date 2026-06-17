<script lang="ts">
	import CommonLabel from '$components/CommonLabel.svelte';

	let {
		courses,
		professors,
		selectedCourse = $bindable<string>(),
		selectedProfessor = $bindable<string>()
	} = $props();
</script>

<div class="filter">
	<CommonLabel labelFor="course" labelString="강의">
		<select id="course" bind:value={selectedCourse}>
			<option value="">전체</option>
			{#each courses as course (course._id)}
				<option value={course._id}>[{course._id}] {course.name}</option>
			{/each}
		</select>
	</CommonLabel>

	<CommonLabel labelFor="professor" labelString="교수">
		<select id="professor" bind:value={selectedProfessor}>
			<option value="">전체</option>
			{#each professors as professor (professor._id)}
				<option value={professor._id}>{professor.name} 교수님</option>
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

		select {
			width: 100%;
		}
	}
</style>
