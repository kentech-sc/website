<script lang="ts">
	import BoardForm from '../_components/BoardForm.svelte';
	import BoardHeader from '../_components/BoardHeader.svelte';

	const { data } = $props();

	const user = $derived(data.user);
</script>

<BoardHeader pageType="new" />
<BoardForm {user} />
