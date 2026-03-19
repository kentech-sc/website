<script lang="ts">
	import type { Petition } from '$lib/types/petition.type.js';

	import PetitionHeader from './_components/PetitionHeader.svelte';
	import PetitionList from './_components/PetitionList.svelte';

	let { data } = $props();
	const petitions = $derived<Petition[]>(JSON.parse(data?.petitions || '[]'));
	const fromId = $derived<string | undefined>(data?.fromId);
	const toId = $derived<string | undefined>(data?.toId);
</script>

<PetitionHeader pageType="list" />
<PetitionList {petitions} {toId} {fromId} />
