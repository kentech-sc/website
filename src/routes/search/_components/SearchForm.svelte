<script lang="ts">
	import Search from '@lucide/svelte/icons/search';

	import ActionForm from '$components/ActionForm.svelte';
</script>

<ActionForm actionName="search" formName="search">
	<div>
		<label class="form-field" for="query"
			><span>검색어</span>
			<!-- svelte-ignore a11y_autofocus -->
			<input type="text" id="query" name="query" autofocus /></label
		>
		<button class="ui-button is-primary" type="submit"><Search size="0.8rem" />검색</button>
	</div>
</ActionForm>

<style>
	div {
		display: flex;
		align-items: end;
		gap: 0.6rem;
	}
	label {
		max-width: 30rem;
	}
	button {
		flex-shrink: 0;
	}
</style>
