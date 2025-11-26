<script lang="ts">
	import type { Post } from '$lib/types/post.type.js';

	import BoardForm from '../../_components/BoardForm.svelte';
	import BoardHeader from '../../_components/BoardHeader.svelte';

	let { data } = $props();
	const post = $state<Post>(JSON.parse(data?.post || '{}'));
</script>

<BoardHeader pageType="edit" />
<BoardForm {post} />
