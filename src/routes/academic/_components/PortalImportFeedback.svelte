<script lang="ts">
	let {
		form
	}: {
		form?: {
			importedCount?: number;
			failedCount?: number;
			withdrawnCount?: number;
			newCourseCodes?: string[];
			nameMismatchCodes?: string[];
			message?: string;
		} | null;
	} = $props();
</script>

{#if form?.importedCount}
	<div class="import-feedback" aria-live="polite">
		<p class="is-success">
			{form.importedCount}개 이수 내역을 반영했습니다.{form.failedCount
				? ` 낙제 ${form.failedCount}개 포함.`
				: ''}{form.withdrawnCount ? ` 철회 ${form.withdrawnCount}개 포함.` : ''}
		</p>
		{#if form.newCourseCodes?.length}
			<p class="is-note">목록에 없어 새로 등록된 강의: {form.newCourseCodes.join(', ')}</p>
		{/if}
		{#if form.nameMismatchCodes?.length}
			<p class="is-warning">
				같은 코드가 다른 강의명으로 등록되어 있어 제외됨: {form.nameMismatchCodes.join(', ')}
			</p>
		{/if}
	</div>
{:else if form?.message}
	<p class="import-feedback is-warning" aria-live="polite">{form.message}</p>
{/if}

<style lang="scss">
	.import-feedback {
		display: grid;
		gap: 0.2rem;
		margin: 0;
		font-size: 0.8rem;
	}
	.import-feedback p {
		margin: 0;
	}
	.is-success {
		color: var(--success-text);
	}
	.is-note {
		color: var(--info-text);
	}
	.is-warning {
		color: var(--error-text);
	}
</style>
