<script lang="ts">
	import type { Post } from '$lib/types/post.type.js';
	import type { FileMeta } from '$lib/types/file-meta.type.js';

	import BoardForm from '../../_components/BoardForm.svelte';
	import BoardHeader from '../../_components/BoardHeader.svelte';

	let { data } = $props();
	const post = $derived<Post>(data.post);
	const fileMetas = $derived<Array<FileMeta>>(data.files);
</script>

<BoardHeader pageType="edit" />
{#key post._id}
	<BoardForm {post} {fileMetas} />
{/key}
