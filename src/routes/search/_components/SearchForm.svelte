<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';
</script>

<section class="module">
	<CommonForm actionName="search" formName="search">
		<div class="search-form-row">
			<label for="query">검색어</label>
			<!-- svelte-ignore a11y_autofocus -->
			<input class="search-input" type="text" id="query" name="query" autofocus />
			<button type="submit">검색</button>
		</div>
	</CommonForm>
</section>

<style lang="scss">
	.search-form-row {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.search-input {
		width: min(100%, 30rem);
		padding: 0.4rem 0.6rem;
		font-size: 1rem;
	}

	@media (max-width: 768px) {
		.search-form-row {
			flex-direction: column;
			align-items: flex-start;
		}

		.search-input {
			width: 100%;
		}
	}
</style>
