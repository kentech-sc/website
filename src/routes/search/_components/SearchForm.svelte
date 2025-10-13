<script>
	import CommonForm from '$lib/components/CommonForm.svelte';
</script>

<section class="module">
	<CommonForm actionName="search" formName="search">
		<div id="form-div">
			<label for="query">검색어: </label>
			<!-- svelte-ignore a11y_autofocus -->
			<input type="text" id="query" name="query" autofocus />
			<button type="submit">검색</button>
		</div>
	</CommonForm>
</section>

<style lang="scss">
	#form-div {
		width: stretch;
		align-items: flex-start;
		input {
			width: 50%;
			padding: 0.3rem 0.6rem;
			font-size: 1.2rem;
		}
	}
</style>
