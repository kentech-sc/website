<script lang="ts">
	import Users from '@lucide/svelte/icons/users';

	import type { ActionResult } from '@sveltejs/kit';

	import { invalidateAll } from '$app/navigation';
	import CommonForm from '$components/CommonForm.svelte';

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			alert('권한이 변경되었습니다.');
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
		margin-top: 1.6rem;
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

		input,
		select {
			height: 2.6rem;
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

	.change-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1rem;
		background: var(--warn);
		color: var(--tertiary-text);
		border: none;
		border-radius: 0.4rem;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;

		&:hover {
			background: var(--warn-strong-hover);
		}
	}

	@media (max-width: 768px) {
		.change-btn {
			justify-content: center;
		}
	}
</style>
