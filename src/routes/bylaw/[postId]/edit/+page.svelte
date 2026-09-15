<script lang="ts">
	import BoardForm from '../../../board/_components/BoardForm.svelte';
	import BoardHeader from '../../../board/_components/BoardHeader.svelte';

	import type { FileMeta } from '$lib/types/file-meta.type.js';
	import type { Post } from '$lib/types/post.type.js';

	import { BoardId } from '$lib/types/board.type.js';

	let { data } = $props();
	const post = $derived<Post>(data.post);
	const fileMetas = $derived<FileMeta[]>(data.files);
</script>

<BoardHeader boardId={BoardId.Bylaw} pageType="edit" />
{#key post.id}
	<BoardForm {post} user={data.user} {fileMetas} />
{/key}
