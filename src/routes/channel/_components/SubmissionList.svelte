<script lang="ts">
	import type { FilePresence } from '$lib/types/general.type';
	import type { Page } from '$lib/types/general.type';
	import type { Submission } from '$lib/types/submission.type.js';

	import CommonList from '$components/CommonList.svelte';

	const {
		submissionPage,
		filePresence,
		emptyMessage
	}: { submissionPage: Page<Submission>; filePresence: FilePresence; emptyMessage: string } =
		$props();
</script>

<section class="container-col module">
	{#if submissionPage.items.length === 0}
		<p>{emptyMessage}</p>
	{:else}
		<CommonList page={submissionPage} {filePresence} />
	{/if}
</section>

<style lang="scss">
	section {
		padding: 0;
	}

	p {
		padding: 0.8rem 1rem;
		width: 100%;
	}
</style>
