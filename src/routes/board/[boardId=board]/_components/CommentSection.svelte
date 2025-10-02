<script lang="ts">
	import CommentForm from './CommentForm.svelte';
	import CommentList from './CommentList.svelte';

	let { comments, user } = $props();
</script>

<section class="container-col module">
	{#if user.group !== 'guest'}
		<CommentForm {user} />
	{/if}
	<CommentList {comments} {user} />
</section>
