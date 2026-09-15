<script lang="ts">
	import SubmissionForm from '../../_components/SubmissionForm.svelte';
	import SubmissionHeader from '../../_components/SubmissionHeader.svelte';

	let { data } = $props();
</script>

<SubmissionHeader mode="feedback" pageType="new" />
<SubmissionForm user={data.user} mode="feedback" />
