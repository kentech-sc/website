<script lang="ts">
	import type { Post } from '$lib/types/post.type.js';
	import type { FileMeta } from '$lib/types/file-meta.type.js';

	import BoardForm from '../../_components/BoardForm.svelte';
	import BoardHeader from '../../_components/BoardHeader.svelte';

	let { data } = $props();
	const post = $derived<Post>(JSON.parse(data?.post ?? '{}'));
	const fileMetas = $derived<Array<FileMeta>>(JSON.parse(data?.files ?? '[]'));
</script>

<BoardHeader pageType="edit" />
<BoardForm {post} initialFileMetas={fileMetas} />
