<script lang="ts">
	import Ban from '@lucide/svelte/icons/ban';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';

	import type { ActionResult } from '@sveltejs/kit';

	import { invalidateAll } from '$app/navigation';
	import CommonForm from '$components/CommonForm.svelte';

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			alert('처리가 완료되었습니다.');
			invalidateAll();
		}
	});
</script>

<div class="admin-forms">
	<CommonForm actionName="blockUser" formName="blockUser" bind:formResult>
		<div class="form-block">
			<div class="form-header">
				<Ban size="1rem" />
				<span>사용자 차단</span>
			</div>

			<div class="form-content">
				<div class="input-group">
					<label for="block-email">차단할 사용자 이메일</label>
					<input
						type="text"
						name="email"
						id="block-email"
						placeholder="user@example.com"
						required
					/>
				</div>

				<div class="input-group">
					<label for="duration">차단 기간 (분)</label>
					<input type="number" name="duration" id="duration" placeholder="60" min="1" required />
				</div>

				<button type="submit" class="block-btn">
					<Ban size="1rem" />
					<span>차단하기</span>
				</button>
			</div>
		</div>
	</CommonForm>

	<CommonForm actionName="unblockUser" formName="unblockUser" bind:formResult>
		<div class="form-block">
			<div class="form-header">
				<ShieldCheck size="1rem" />
				<span>차단 해제</span>
			</div>

			<div class="form-content">
				<div class="input-group">
					<label for="unblock-email">차단 해제할 사용자 이메일</label>
					<input
						type="text"
						name="email"
						id="unblock-email"
						placeholder="user@example.com"
						required
					/>
				</div>

				<button type="submit" class="unblock-btn">
					<ShieldCheck size="1rem" />
					<span>차단 해제하기</span>
				</button>
			</div>
		</div>
	</CommonForm>
</div>

<style lang="scss">
	.admin-forms {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-block {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: var(--gray-bg);
		border: 0.1rem solid var(--gray-border);
		border-radius: 0.4rem;
	}

	.form-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text);
		font-weight: 600;
		font-size: 1rem;
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
			color: var(--gray-text);
			font-weight: 500;
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
				border-color: var(--secondary);
				box-shadow: 0 0 0 0.1rem var(--secondary-bg);
			}

			&::placeholder {
				color: var(--gray-text);
				opacity: 0.7;
			}
		}
	}

	.block-btn,
	.unblock-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1rem;
		color: var(--tertiary-text);
		border: none;
		border-radius: 0.4rem;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
	}

	.block-btn {
		background: var(--error);

		&:hover {
			background: var(--error-strong-hover);
		}
	}

	.unblock-btn {
		background: var(--success);

		&:hover {
			background: var(--success-strong-hover);
		}
	}

	@media (max-width: 768px) {
		.block-btn,
		.unblock-btn {
			justify-content: center;
		}
	}
</style>
