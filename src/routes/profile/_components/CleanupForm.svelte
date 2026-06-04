<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { ActionResult } from '@sveltejs/kit';
	import Clock from '@lucide/svelte/icons/clock';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	import CommonForm from '$components/CommonForm.svelte';

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			const deletedCnt = formResult.data?.deletedCnt || 0;
			alert(`${deletedCnt}개의 파일이 삭제되었습니다.`);
			invalidateAll();
		}
	});
</script>

<CommonForm actionName="cleanup" formName="cleanup" bind:formResult>
	<div class="form-block">
		<div class="form-header">
			<Trash2 size="1rem" />
			<span>미사용 파일 정리</span>
		</div>

		<div class="warning-message">
			<div class="warning-icon">
				<Clock size="1.25rem" />
			</div>
			<div class="warning-content">
				<p>지정된 시간 이상 사용되지 않은 파일들을 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
			</div>
		</div>

		<div class="form-content">
			<div class="input-group">
				<label for="hours">기준 시간 (시간)</label>
				<input type="number" name="hours" id="hours" value="24" min="1" placeholder="24" required />
			</div>

			<button type="submit" class="cleanup-btn">
				<Trash2 size="1rem" />
				<span>파일 정리하기</span>
			</button>
		</div>
	</div>
</CommonForm>

<style lang="scss">
	.form-block {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: var(--error-bg);
		border: 0.1rem solid var(--error);
		border-radius: 0.4rem;
	}

	.form-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--error-text);
		font-weight: 600;
		font-size: 1rem;
	}

	.warning-message {
		display: flex;
		gap: 0.8rem;
		padding: 0.8rem;
		background: var(--error-hover);
		border: 0.1rem solid var(--error);
		border-radius: 0.3rem;
		color: var(--error);

		.warning-icon {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
		}

		.warning-content {
			flex: 1;

			p {
				margin: 0;
				font-size: 0.8rem;
				line-height: 1.4;
			}
		}
	}

	.form-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		label {
			font-size: 0.9rem;
			color: var(--text);
			font-weight: 600;
		}

		input {
			padding: 0.5rem 0.8rem;
			border: 0.1rem solid var(--gray-border);
			border-radius: 0.4rem;
			background: var(--surface-base);
			color: var(--text);
			font-size: 0.9rem;

			&:focus {
				outline: none;
				border-color: var(--error);
				box-shadow: 0 0 0 0.1rem var(--error-bg);
			}
		}
	}

	.cleanup-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1rem;
		background: var(--error);
		color: var(--tertiary-text);
		border: none;
		border-radius: 0.4rem;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;

		&:hover {
			background: var(--error-strong-hover);
		}
	}

	@media (max-width: 768px) {
		.cleanup-btn {
			justify-content: center;
		}
	}
</style>
