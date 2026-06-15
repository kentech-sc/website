<script lang="ts">
	import BoardHeader from './_components/BoardHeader.svelte';
	import BoardList from './_components/BoardList.svelte';

	let { data } = $props();
	const postPage = $derived(data.postPage);
	const filePresence = $derived(data.filePresence);
	const canCreatePost = $derived<boolean>(data.canCreatePost);
</script>

<BoardHeader pageType="list" {canCreatePost} />
<BoardList {postPage} {filePresence} />
