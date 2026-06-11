<script lang="ts">
	let {
		courses,
		professors,
		selectedCourse = $bindable<string>(),
		selectedProfessor = $bindable<string>()
	} = $props();
</script>

<div class="filter-row">
	<div class="field-group filter-field">
		<label for="course">강의</label>
		<select id="course" bind:value={selectedCourse}>
			<option value="">전체</option>
			{#each courses as course (course._id)}
				<option value={course._id}>[{course._id}] {course.name}</option>
			{/each}
		</select>
	</div>

	<div class="field-group filter-field">
		<label for="professor">교수</label>
		<select id="professor" bind:value={selectedProfessor}>
			<option value="">전체</option>
			{#each professors as professor (professor._id)}
				<option value={professor._id}>{professor.name} 교수님</option>
			{/each}
		</select>
	</div>
</div>

<style lang="scss">
	.filter-row {
		width: 100%;
		display: flex;
		justify-content: flex-start;
		gap: 0.6rem;
		margin-bottom: 0.6rem;
	}

	.filter-field {
		flex: 0 1 20rem;
	}

	@media (max-width: 768px) {
		.filter-row {
			flex-direction: column;
		}

		.filter-field {
			width: 100%;
		}
	}
</style>
