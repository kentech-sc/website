<script lang="ts">
	import Search from '@lucide/svelte/icons/search';

	import CommonForm from '$components/CommonForm.svelte';
</script>

<CommonForm actionName="search" formName="search">
	<div class="form-div">
		<label for="query" class="input-label">검색어</label>
		<!-- svelte-ignore a11y_autofocus -->
		<input type="text" id="query" name="query" autofocus />
		<button class="action-btn" type="submit"><Search size="0.8rem" />검색</button>
	</div>
</CommonForm>

<style lang="scss">
	.form-div {
		position: relative;
		margin-top: 1rem;
	}

	input {
		width: 30rem;
		font-size: 0.9rem;
	}
</style>
