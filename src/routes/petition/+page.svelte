<script lang="ts">
	import PetitionHeader from './_components/PetitionHeader.svelte';
	import PetitionList from './_components/PetitionList.svelte';

	let { data } = $props();

	const petitionPage = $derived(data.petitionPage);
	const filePresence = $derived(data.filePresence);
	const canCreatePetition = $derived<boolean>(data.canCreatePetition);
</script>

<PetitionHeader pageType="list" {canCreatePetition} />
<PetitionList {petitionPage} {filePresence} />
