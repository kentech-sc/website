<script lang="ts">
	import ResponsePanel from '../../_components/ResponsePanel.svelte';
	import SubmissionArticle from '../../_components/SubmissionArticle.svelte';
	import SubmissionHeader from '../../_components/SubmissionHeader.svelte';

	import type { FileMeta } from '$lib/types/file-meta.type.js';
	import type { Submission } from '$lib/types/submission.type.js';

	import FileList from '$components/FileList.svelte';

	let { data } = $props();
	const submission = $derived<Submission>(data.submission);
	const fileMetas = $derived<FileMeta[]>(data.files);
</script>

<SubmissionHeader mode="feedback" pageType="detail" />
<div class="container-col">
	<SubmissionArticle {submission} user={data.user} permissions={data.permissions} />
	<FileList {fileMetas} isEditing={false} />
	<ResponsePanel {submission} permissions={data.permissions} />
</div>

<style lang="scss">
	div {
		gap: 1rem;
		width: 100%;
	}
</style>
