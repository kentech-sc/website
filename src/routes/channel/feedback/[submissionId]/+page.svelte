<script lang="ts">
	import SubmissionArticle from '../../_components/SubmissionArticle.svelte';
	import SubmissionHeader from '../../_components/SubmissionHeader.svelte';
	import SubmissionResponse from '../../_components/SubmissionResponse.svelte';

	import type { FileMeta } from '$lib/types/file-meta.type.js';
	import type { Submission } from '$lib/types/submission.type.js';

	import FileList from '$components/FileList.svelte';

	let { data } = $props();
	const submission = $derived<Submission>(data.submission);
	const fileMetas = $derived<FileMeta[]>(data.files);
</script>

<section class="page">
	<SubmissionHeader mode="feedback" pageType="detail" />

	<SubmissionArticle {submission} user={data.user} permissions={data.permissions} />
	<FileList {fileMetas} isEditing={false} />
	<SubmissionResponse {submission} permissions={data.permissions} listHref="/channel/feedback" />
</section>
