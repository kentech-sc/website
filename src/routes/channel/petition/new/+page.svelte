<script lang="ts">
	import SubmissionForm from '../../_components/SubmissionForm.svelte';
	import SubmissionHeader from '../../_components/SubmissionHeader.svelte';

	const { data } = $props();

	const user = $derived(data.user);
</script>

<SubmissionHeader mode="petition" pageType="new" />
<SubmissionForm {user} mode="petition" />
