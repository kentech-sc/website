<script lang="ts">
	import SubmissionForm from '../../../_components/SubmissionForm.svelte';
	import SubmissionHeader from '../../../_components/SubmissionHeader.svelte';

	let { data } = $props();
</script>

<section class="page">
	<SubmissionHeader mode="feedback" pageType="edit" />
	<SubmissionForm
		user={data.user}
		mode="feedback"
		submission={data.submission}
		fileMetas={data.files}
	/>
</section>
