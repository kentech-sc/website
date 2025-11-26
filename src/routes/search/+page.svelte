<script lang="ts">
	import SearchHeader from './_components/SearchHeader.svelte';
	import SearchList from './_components/SearchList.svelte';
	import SearchForm from './_components/SearchForm.svelte';

	import type { Post } from '$lib/types/post.type.js';
	import type { Review } from '$lib/types/review.type.js';
	import type { Petition } from '$lib/types/petition.type.js';

	let { data } = $props();
	const results = $derived<(Post | Review | Petition)[]>(JSON.parse(data?.results ?? '[]'));
	const query = $derived<string>(data?.query ?? '');
	const page = $derived<number>(data?.page ?? 1);
	const more = $derived<boolean>(data?.more ?? false);
</script>

<SearchHeader />
<SearchForm />
<SearchList {results} {query} {page} {more} />
