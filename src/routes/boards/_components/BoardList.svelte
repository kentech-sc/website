<script lang="ts">
	import PostListItem from './PostListItem.svelte';

	import type { FilePresence } from '$lib/types/general.type';
	import type { Page } from '$lib/types/general.type';
	import type { Post } from '$lib/types/post.type';

	import PaginatedList from '$components/PaginatedList.svelte';

	const { postPage, filePresence }: { postPage: Page<Post>; filePresence: FilePresence } = $props();
</script>

<PaginatedList page={postPage} emptyMessage="작성된 글이 없습니다.">
	{#snippet item(post)}
		<PostListItem {post} attachment={filePresence[post.id]} />
	{/snippet}
</PaginatedList>
