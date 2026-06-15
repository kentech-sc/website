<script lang="ts">
	import SearchForm from './_components/SearchForm.svelte';
	import SearchHeader from './_components/SearchHeader.svelte';
	import SearchList from './_components/SearchList.svelte';

	let { data } = $props();
	const searchPage = $derived(data.searchPage);
</script>

<SearchHeader />
<SearchForm />
<SearchList {searchPage} />
