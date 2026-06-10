<script lang="ts">
	import SearchForm from './_components/SearchForm.svelte';
	import SearchHeader from './_components/SearchHeader.svelte';
	import SearchList from './_components/SearchList.svelte';

	import type { PetitionEntity } from '$lib/types/petition.type.js';
	import type { PostEntity } from '$lib/types/post.type.js';
	import type { ReviewEntity } from '$lib/types/review.type.js';

	let { data } = $props();
	const results = $derived<(PostEntity | ReviewEntity | PetitionEntity)[]>(data.results);
	const query = $derived<string>(data.query ?? '');
	const page = $derived<number>(data.page ?? 1);
	const more = $derived<boolean>(data.more ?? false);
</script>

<SearchHeader />
<SearchForm />
<SearchList {results} {query} {page} {more} />
