<script lang="ts">
	import AcademicOverview from './_components/AcademicOverview.svelte';
	import AcademicRecords from './_components/AcademicRecords.svelte';

	import PageHeader from '$components/PageHeader.svelte';

	let { data, form } = $props();
</script>

<section class="page">
	<PageHeader
		title="성적·졸업"
		description="지금까지 이수한 교과목과 졸업까지 남은 요건을 한눈에 확인하세요."
	/>
	<AcademicOverview
		records={data.records}
		espCourses={data.espCourses}
		academicProfile={data.academicProfile}
		degreeProgress={data.degreeProgress}
		gpa={data.gpa}
		gpaByTerm={data.gpaByTerm}
	/>
	<AcademicRecords
		records={data.records}
		courses={data.courses}
		profile={data.academicProfile}
		{form}
	/>
</section>

<style lang="scss">
	section :global(details.module > summary) {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		cursor: pointer;
		padding: 0.8rem;
		list-style: none;
	}
	section :global(details.module > summary::-webkit-details-marker) {
		display: none;
	}
</style>
