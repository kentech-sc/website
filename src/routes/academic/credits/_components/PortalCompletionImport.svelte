<script lang="ts">
	import Upload from '@lucide/svelte/icons/upload';

	import PortalImportFeedback from './PortalImportFeedback.svelte';
	import PortalImportForm from './PortalImportForm.svelte';
	import PortalImportGuide from './PortalImportGuide.svelte';
	import RecordEntryDialog from './RecordEntryDialog.svelte';

	import type { Course } from '$lib/types/course.type.js';

	import { page } from '$app/state';
	import {
		KIS_COMPLETION_EXTRACTOR,
		buildKisCompletionBookmarkletHref
	} from '$lib/shared/portal-completion-import.js';

	let {
		courses,
		form
	}: {
		courses: Course[];
		form?: {
			importedCount?: number;
			failedCount?: number;
			withdrawnCount?: number;
			newCourseCodes?: string[];
			nameMismatchCodes?: string[];
			skippedCount?: number;
			message?: string;
		} | null;
	} = $props();

	let importOpen = $state(false);
	let scriptCopied = $state(false);
	const bookmarkletHref = $derived(buildKisCompletionBookmarkletHref(page.url.origin));

	const copyExtractor = async () => {
		await navigator.clipboard.writeText(KIS_COMPLETION_EXTRACTOR);
		scriptCopied = true;
		setTimeout(() => (scriptCopied = false), 2000);
	};

	$effect(() => {
		if (form?.importedCount) importOpen = true;
	});
</script>

<RecordEntryDialog
	title="KIS에서 한 번에 가져오기"
	description="여러 학기의 이수 내역을 빠르게 등록합니다"
	emphasis
	bind:open={importOpen}
>
	{#snippet icon()}<Upload size="1rem" />{/snippet}
	<div class="portal-import-workflow">
		<PortalImportGuide {bookmarkletHref} {scriptCopied} onCopyScript={copyExtractor} />
		<PortalImportForm {courses} />
		<PortalImportFeedback {form} />
	</div>
</RecordEntryDialog>

<style lang="scss">
	.portal-import-workflow {
		display: grid;
		gap: 0.8rem;
	}
</style>
