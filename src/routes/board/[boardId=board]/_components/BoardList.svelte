<script lang="ts">
	import type { FilePresence } from '$lib/types/general.type';
	import type { Page } from '$lib/types/general.type';
	import type { Post } from '$lib/types/post.type';

	import CommonList from '$components/CommonList.svelte';

	const { postPage, filePresence }: { postPage: Page<Post>; filePresence: FilePresence } = $props();
</script>

<section class="container-col module">
	{#if postPage.items.length === 0}
		<p>작성된 글이 없습니다.</p>
	{:else}
		<CommonList page={postPage} {filePresence} />
	{/if}
</section>

<style lang="scss">
	section {
		padding: 0;
	}

	p {
		padding: 0.8rem 1rem;
		width: 100%;
	}
</style>
