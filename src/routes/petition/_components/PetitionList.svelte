<script lang="ts">
	import type { FilePresence } from '$lib/types/general.type';
	import type { Page } from '$lib/types/general.type';
	import type { Petition } from '$lib/types/petition.type';

	import CommonList from '$components/CommonList.svelte';

	const {
		petitionPage,
		filePresence
	}: { petitionPage: Page<Petition>; filePresence: FilePresence } = $props();
</script>

<section class="container-col module">
	{#if petitionPage.items.length === 0}
		<p>작성된 청원이 없습니다.</p>
	{:else}
		<CommonList href="/petition" page={petitionPage} {filePresence} />
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
