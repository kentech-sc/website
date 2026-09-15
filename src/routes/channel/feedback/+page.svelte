<script lang="ts">
	import SubmissionHeader from '../_components/SubmissionHeader.svelte';
	import SubmissionList from '../_components/SubmissionList.svelte';

	let { data } = $props();
</script>

<SubmissionHeader mode="feedback" pageType="list" canCreate={data.canCreateFeedback} />
<SubmissionList
	submissionPage={data.submissionPage}
	filePresence={data.filePresence}
	emptyMessage="작성된 문의·건의가 없습니다."
/>
