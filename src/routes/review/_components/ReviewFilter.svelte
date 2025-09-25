<script lang="ts">
	let {
		courses,
		professors,
		selectedCourse = $bindable<string>(),
		selectedProfessor = $bindable<string>()
	} = $props();
</script>

{#snippet CourseFilter()}
	<div>
		<label for="course">강의</label>
		<select id="course" bind:value={selectedCourse}>
			<option value="">전체</option>
			{#each courses as course (course._id)}
				<option value={course._id}>[{course.code}] {course.name}</option>
			{/each}
		</select>
	</div>
{/snippet}

{#snippet ProfessorFilter()}
	<div>
		<label for="professor">교수</label>
		<select id="professor" bind:value={selectedProfessor}>
			<option value="">전체</option>
			{#each professors as professor (professor._id)}
				<option value={professor._id}>{professor.name} 교수님</option>
			{/each}
		</select>
	</div>
{/snippet}

<div class="container" id="filter-div">
	{@render CourseFilter()}
	{@render ProfessorFilter()}
</div>

<style lang="scss">
	#filter-div {
		width: stretch;
		justify-content: flex-start;
		margin-bottom: 0.5rem;

		div:nth-child(2) {
			margin-left: 1rem;
		}
	}
</style>
