<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';
	import Users from '@lucide/svelte/icons/users';
	import type { ActionResult } from '@sveltejs/kit';
	import { invalidateAll } from '$app/navigation';

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			alert('권한이 변경되었습니다!');
			invalidateAll();
		}
	});
</script>

<CommonForm actionName="changeGroup" formName="changeGroup" bind:formResult>
	<div class="form-block">
		<div class="form-header">
			<Users size="1rem" />
			<span>권한 변경</span>
		</div>

		<div class="form-content">
			<div class="input-group">
				<label for="group-email">대상 사용자 이메일</label>
				<input type="text" name="email" id="group-email" placeholder="user@example.com" required />
			</div>

			<div class="input-group">
				<label for="group">새로운 권한</label>
				<select name="group" id="group" required>
					<option value="">권한 선택</option>
					<option value="user">user</option>
					<option value="moderator">moderator</option>
					<option value="manager">manager</option>
				</select>
			</div>

			<button type="submit" class="change-btn">
				<Users size="1rem" />
				<span>권한 변경하기</span>
			</button>
		</div>
	</div>
</CommonForm>

<style lang="scss">
	.form-block {
		margin-top: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
	}

	.form-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #374151;
		font-weight: 600;
		font-size: 0.95rem;
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
			font-size: 0.875rem;
			color: #6b7280;
			font-weight: 500;
		}

		input,
		select {
			height: 2.5rem;
			padding: 0.5rem 0.75rem;
			border: 1px solid #d1d5db;
			border-radius: 0.375rem;
			background: white;
			color: #1f2937;
			font-size: 0.875rem;

			&:focus {
				outline: none;
				border-color: #3b82f6;
				box-shadow: 0 0 0 1px #3b82f6;
			}

			&::placeholder {
				color: #9ca3af;
			}
		}
	}

	.change-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #f59e0b;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;

		&:hover {
			background: #d97706;
		}
	}

	@media (max-width: 768px) {
		.change-btn {
			justify-content: center;
		}
	}
</style>
