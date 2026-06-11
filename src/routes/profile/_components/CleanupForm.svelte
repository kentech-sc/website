<script lang="ts">
	import Clock from '@lucide/svelte/icons/clock';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	import type { ActionResult } from '@sveltejs/kit';

	import { invalidateAll } from '$app/navigation';
	import CommonForm from '$components/CommonForm.svelte';

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			const deletedCnt = formResult.data?.deletedCnt || 0;
			alert(`${deletedCnt}개의 파일을 정리했습니다.`);
			invalidateAll();
		}
	});
</script>

<CommonForm actionName="cleanup" formName="cleanup" bind:formResult>
	<div class="form-card form-card-danger cleanup-card">
		<div class="form-card-header cleanup-header">
			<Trash2 size="0.8rem" />
			<span>미사용 파일 정리</span>
		</div>

		<div class="cleanup-warning">
			<div class="cleanup-warning-icon">
				<Clock size="1.1rem" />
			</div>
			<div class="cleanup-warning-copy">
				<p>지정한 시간 이상 사용되지 않은 파일을 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
			</div>
		</div>

		<div class="form-card-body">
			<div class="field-group field-group-strong">
				<label for="cleanup-hours">기준 시간 (시간)</label>
				<input
					type="number"
					name="hours"
					id="cleanup-hours"
					value="24"
					min="1"
					placeholder="24"
					required
				/>
			</div>

			<div class="form-actions-end">
				<button type="submit" class="error-btn">
					<Trash2 size="0.8rem" />
					<span>파일 정리하기</span>
				</button>
			</div>
		</div>
	</div>
</CommonForm>

<style lang="scss">
	.cleanup-card input:focus {
		border-color: var(--error);
		box-shadow: 0 0 0 0.1rem var(--error-bg);
	}

	.cleanup-header {
		color: var(--error-text);
	}

	.cleanup-warning {
		display: flex;
		gap: 0.8rem;
		padding: 0.8rem;
		background: var(--error-hover);
		border: 0.1rem solid var(--error);
		border-radius: 0.4rem;
		color: var(--error);
	}

	.cleanup-warning-icon {
		flex-shrink: 0;
		display: flex;
		align-items: flex-start;
	}

	.cleanup-warning-copy p {
		font-size: 0.7rem;
		line-height: 1.5;
	}
</style>
