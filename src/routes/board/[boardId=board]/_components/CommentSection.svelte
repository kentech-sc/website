<script lang="ts">
	import CommentForm from './CommentForm.svelte';
	import CommentList from './CommentList.svelte';

	let { authorId, comments, user } = $props();
</script>

<section class="container-col module">
	{#if user.group !== 'guest'}
		<CommentForm {user} />
	{/if}
	<CommentList {authorId} {comments} {user} />
</section>
