<script lang="ts">
	import PetitionArticle from '../_components/PetitionArticle.svelte';
	import PetitionHeader from '../_components/PetitionHeader.svelte';
	import ResponseArticle from '../_components/ResponseArticle.svelte';
	import Signers from '../_components/Signers.svelte';

	import type { FileMeta } from '$lib/types/file-meta.type.js';
	import type { Petition } from '$lib/types/petition.type.js';

	import { page } from '$app/state';
	import FileList from '$components/FileList.svelte';

	const user = $derived(page.data.user);

	let { data } = $props();
	const petition = $derived<Petition>(data.petition);
	const signerNames = $derived<string[]>(data.signerNames);
	const fileMetas = $derived<FileMeta[]>(data.files);
	const permissions = $derived(data.permissions);
</script>

<PetitionHeader pageType="detail" />
<div class="container-col">
	<PetitionArticle {petition} {user} {permissions} />
	<FileList {fileMetas} isEditing={false} />
	<ResponseArticle {petition} {permissions} />
	<Signers {signerNames} />
</div>

<style lang="scss">
	div {
		gap: 1rem;
		width: 100%;
	}
</style>
