<script lang="ts">
	import ResponsePanel from '../../_components/ResponsePanel.svelte';
	import SubmissionArticle from '../../_components/SubmissionArticle.svelte';
	import SubmissionHeader from '../../_components/SubmissionHeader.svelte';
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

<SubmissionHeader mode="petition" pageType="detail" />
<div class="container-col">
	<SubmissionArticle submission={petition} {user} {permissions} />
	<FileList {fileMetas} isEditing={false} />
	<ResponsePanel submission={petition} {permissions} />
	<SupportList {supporterNames} />
</div>

<style lang="scss">
	div {
		gap: 1rem;
		width: 100%;
	}
</style>
