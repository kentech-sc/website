<script lang="ts">
	import BoardForm from '../../../_components/BoardForm.svelte';
	import BoardHeader from '../../../_components/BoardHeader.svelte';

	import type { BoardId } from '$lib/types/board.type.js';
	import type { FileMeta } from '$lib/types/file-meta.type.js';
	import type { Post } from '$lib/types/post.type.js';

	import { page } from '$app/state';

	const user = $derived(page.data.user);

	let { data } = $props();
	const post = $derived<Post>(data.post);
	const fileMetas = $derived<Array<FileMeta>>(data.files);
	const boardId = $derived(page.params.boardId as BoardId);
</script>

<BoardHeader {boardId} pageType="edit" />
{#key post.id}
	<BoardForm {post} {user} {fileMetas} />
{/key}
