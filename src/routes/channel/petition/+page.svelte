<script lang="ts">
	import SubmissionHeader from '../_components/SubmissionHeader.svelte';
	import SubmissionList from '../_components/SubmissionList.svelte';

	let { data } = $props();

	const petitionPage = $derived(data.petitionPage);
	const filePresence = $derived(data.filePresence);
	const canCreatePetition = $derived<boolean>(data.canCreatePetition);
</script>

<SubmissionHeader mode="petition" pageType="list" canCreate={canCreatePetition} />
<SubmissionList
	submissionPage={petitionPage}
	{filePresence}
	emptyMessage="작성된 청원이 없습니다."
/>
