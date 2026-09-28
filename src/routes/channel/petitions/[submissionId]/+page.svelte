<script lang="ts">
	import PetitionWorkflow from '../../_components/PetitionWorkflow.svelte';
	import SubmissionArticle from '../../_components/SubmissionArticle.svelte';
	import SubmissionHeader from '../../_components/SubmissionHeader.svelte';
	import SubmissionResponse from '../../_components/SubmissionResponse.svelte';
	import SupportList from '../../_components/SupportList.svelte';

	import type { FileMeta } from '$lib/types/file-meta.type.js';
	import type { Submission } from '$lib/types/submission.type.js';

	import { page } from '$app/state';
	import FileList from '$components/FileList.svelte';

	const user = $derived(page.data.user);

	let { data } = $props();
	const petition = $derived<Submission>(data.petition);
	const supporterNames = $derived<string[]>(data.supporterNames);
	const fileMetas = $derived<FileMeta[]>(data.files);
	const permissions = $derived(data.permissions);
</script>

<section class="page">
	<SubmissionHeader mode="petition" pageType="detail" />

	<SubmissionArticle submission={petition} {user} {permissions} />
	<FileList {fileMetas} isEditing={false} />
	<PetitionWorkflow submissionId={petition.id} status={petition.status} {permissions} />
	<SubmissionResponse submission={petition} {permissions} listHref="/channel/petitions" />
	<SupportList {supporterNames} />
</section>
