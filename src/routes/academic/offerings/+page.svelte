<script lang="ts">
	import OfferingImportForm from './_components/OfferingImportForm.svelte';
	import OfferingImportResult from './_components/OfferingImportResult.svelte';

	import PageHeader from '$components/PageHeader.svelte';

	let { form } = $props();
</script>

<section class="page">
	<PageHeader
		title="개설 강의 관리"
		description="학사시스템의 개설교과목 엑셀로 해당 학기의 강의를 갱신합니다."
	/>

	<OfferingImportForm />
	<OfferingImportResult result={form} />
</section>
