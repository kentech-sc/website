<script lang="ts">
	import type { Petition } from '$lib/types/petition.type.js';

	import PetitionHeader from './_components/PetitionHeader.svelte';
	import PetitionList from './_components/PetitionList.svelte';

	let { data } = $props();
	const petitions = $derived<Petition[]>(data.petitions);
	const filePresence = $derived(data.filePresence);
	const prevHref = $derived<string | undefined>(data.prevHref);
	const nextHref = $derived<string | undefined>(data.nextHref);
	const canCreatePetition = $derived<boolean>(data.canCreatePetition);
</script>

<PetitionHeader pageType="list" {canCreatePetition} />
<PetitionList {petitions} {filePresence} {prevHref} {nextHref} />
