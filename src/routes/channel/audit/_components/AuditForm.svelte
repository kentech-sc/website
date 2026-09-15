<script lang="ts">
	import Send from '@lucide/svelte/icons/send';

	import CommonForm from '$components/CommonForm.svelte';
	import CommonLabel from '$components/CommonLabel.svelte';
</script>

<section class="module">
	<CommonForm actionName="submitReport" formName="audit-report">
		<div class="container-col form-fields">
			<CommonLabel labelFor="audit-title" labelString="제목">
				<input id="audit-title" name="title" maxlength="120" required />
			</CommonLabel>

			<CommonLabel labelFor="audit-content" labelString="제보 내용">
				<textarea id="audit-content" name="content" rows="12" maxlength="10000" required></textarea>
			</CommonLabel>

			<button class="action-btn" type="submit">
				<Send size="0.8rem" />
				익명으로 제출
			</button>
		</div>
	</CommonForm>
</section>

<style lang="scss">
	.form-fields {
		align-items: stretch;
		gap: 1rem;
	}

	input,
	textarea {
		width: 100%;
	}

	textarea {
		resize: vertical;
	}

	button {
		align-self: flex-end;
	}
</style>
