<script lang="ts">
	import type { Petition } from '$lib/petition/types.js';
	import PetitionHeader from './_components/PetitionHeader.svelte';
	import PetitionList from './_components/PetitionList.svelte';

	let { data } = $props();
	const petitions = $derived<Petition[]>(JSON.parse(data?.petitions || '[]'));
	const fromId = $derived<string | null>(data?.fromId ?? null);
	const toId = $derived<string | null>(data?.toId ?? null);
</script>

<PetitionHeader pageType="list" />
<PetitionList {petitions} {toId} {fromId} />
