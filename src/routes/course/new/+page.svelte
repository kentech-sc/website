<script lang="ts">
	import CourseForm from '../_components/CourseForm.svelte';
	import CourseHeader from '../_components/CourseHeader.svelte';
	import ProfessorForm from '../_components/ProfessorForm.svelte';

	let { data } = $props();
	const permissions = $derived(data.permissions);
</script>

<CourseHeader />
<section class="container-col">
	{#if permissions.canManageProfessor}
		<ProfessorForm />
	{/if}
	{#if permissions.canManageCourse}
		<CourseForm />
	{/if}
</section>

<style lang="scss">
	section {
		gap: 1rem;
		width: 100%;
	}
</style>
