<script lang="ts">
	import { page } from '$app/state';

	import type { Petition } from '$lib/types/petition.type.js';
	import type { FileMeta } from '$lib/types/file-meta.type.js';

	import PetitionHeader from '../_components/PetitionHeader.svelte';
	import PetitionArticle from '../_components/PetitionArticle.svelte';
	import ResponseArticle from '../_components/ResponseArticle.svelte';
	import Signers from '../_components/Signers.svelte';

	import FileList from '$components/FileList.svelte';

	const user = JSON.parse(page.data.user);

	let { data } = $props();

	let petition = $state<Petition>(JSON.parse(data?.petition ?? '{}'));
	let signersNames = $state<string[]>(JSON.parse(data?.signersNames ?? '[]'));
	let fileMetas = $state<Array<FileMeta>>(JSON.parse(data?.files ?? '[]'));
</script>

<PetitionHeader pageType="detail" />
<PetitionArticle bind:petition bind:signersNames {user} />
<FileList {fileMetas} isEditing={false} />
<ResponseArticle bind:petition {user} />
<Signers {signersNames} />
