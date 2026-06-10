<script lang="ts">
	import PetitionHeader from './_components/PetitionHeader.svelte';
	import PetitionList from './_components/PetitionList.svelte';

	import type { Petition } from '$lib/types/petition.type.js';

	let { data } = $props();
	const petitions = $derived<Petition[]>(data.petitions);
	const filePresence = $derived(data.filePresence);
	const currentPage = $derived<number>(data.currentPage);
	const totalPages = $derived<number>(data.totalPages);
	const canCreatePetition = $derived<boolean>(data.canCreatePetition);
</script>

<PetitionHeader pageType="list" {canCreatePetition} />
<PetitionList {petitions} {filePresence} {currentPage} {totalPages} />
