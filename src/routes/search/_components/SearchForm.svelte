<script>
	import CommonForm from '$lib/components/CommonForm.svelte';
</script>

<section class="module">
	<CommonForm actionName="search" formName="search">
		<div id="form-div">
			<label for="query">검색어: </label>
			<input type="text" id="query" name="query" />
			<button type="submit">검색</button>
		</div>
	</CommonForm>
</section>

<style lang="scss">
	#form-div {
		width: stretch;
		align-items: flex-start;
		// input {
		// 	width: stretch;
		// 	margin-bottom: 0.5rem;
		// }
	}
</style>
