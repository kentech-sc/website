<script lang="ts">
	import CommonForm from '$lib/components/CommonForm.svelte';
</script>

<section class="container-col module">
	<CommonForm actionName="addProfessor" formName="addProfessor">
		<div class="container-col">
			<label for="name">교수님 성함</label>
			<input type="text" id="name" name="name" />
			<button type="submit">추가하기</button>
		</div>
	</CommonForm>
</section>

<style lang="scss">
	div {
		align-items: flex-start;

		input {
			width: stretch;
			margin-bottom: 0.5rem;
		}
	}
</style>
