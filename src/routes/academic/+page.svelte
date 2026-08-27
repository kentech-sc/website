<script lang="ts">
	import AcademicOverview from './_components/AcademicOverview.svelte';
	import AcademicRecords from './_components/AcademicRecords.svelte';

	import AcademicHeader from '$components/AcademicHeader.svelte';

	let { data, form } = $props();
</script>

<section class="academic-page">
	<AcademicHeader
		title="이수·졸업"
		description="지금까지 이수한 교과목과 졸업까지 남은 요건을 한눈에 확인하세요."
		canManageCatalog={data.canManageCatalog}
	/>
	<AcademicOverview {data} />
	<AcademicRecords {data} {form} />
</section>

<style lang="scss">
	.academic-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}
</style>
