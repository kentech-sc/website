<script lang="ts">
	import SubmissionForm from '../../../_components/SubmissionForm.svelte';
	import SubmissionHeader from '../../../_components/SubmissionHeader.svelte';

	let { data } = $props();
</script>

<section class="page">
	<SubmissionHeader mode="petition" pageType="edit" />
	<SubmissionForm
		user={data.user}
		mode="petition"
		submission={data.petition}
		fileMetas={data.files}
	/>
</section>
