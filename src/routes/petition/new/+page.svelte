<script lang="ts">
	import PetitionForm from '../_components/PetitionForm.svelte';
	import PetitionHeader from '../_components/PetitionHeader.svelte';

	const { data } = $props();

	const user = $derived(data.user);
</script>

<PetitionHeader pageType="new" />
<PetitionForm {user} />
