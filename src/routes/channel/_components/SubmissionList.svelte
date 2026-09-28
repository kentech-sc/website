<script lang="ts">
	import SubmissionListItem from './SubmissionListItem.svelte';

	import type { FilePresence } from '$lib/types/general.type';
	import type { Page } from '$lib/types/general.type';
	import type { Submission } from '$lib/types/submission.type.js';

	import PaginatedList from '$components/PaginatedList.svelte';

	const {
		submissionPage,
		filePresence,
		emptyMessage
	}: { submissionPage: Page<Submission>; filePresence: FilePresence; emptyMessage: string } =
		$props();
</script>

<PaginatedList page={submissionPage} {emptyMessage}>
	{#snippet item(submission)}
		<SubmissionListItem {submission} attachment={filePresence[submission.id]} />
	{/snippet}
</PaginatedList>
