<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { ActionResult } from '@sveltejs/kit';
	import User from '@lucide/svelte/icons/user';

	import CommonForm from '$components/CommonForm.svelte';

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			alert('별명이 변경되었습니다.');
			invalidateAll();
		}
	});
</script>

<CommonForm actionName="changeNickname" formName="changeNickname" bind:formResult>
	<div class="nickname-form">
		<div class="form-header">
			<User size="1rem" />
			<span>별명 변경</span>
		</div>

		<div class="form-content">
			<div class="input-group">
				<label for="nickname">새로운 별명</label>
				<input
					type="text"
					name="nickname"
					id="nickname"
					placeholder="4자 이상의 새로운 별명을 입력하세요"
					required
					minlength="4"
				/>
			</div>

			<button type="submit" class="info-btn submit-btn">
				<User size="1rem" />
				<span>변경하기</span>
			</button>
		</div>
	</div>
</CommonForm>

<style lang="scss">
	.nickname-form {
		display: flex;
		flex-direction: column;
	}

	.form-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
		color: var(--text);
		font-weight: 600;
		font-size: 1rem;
	}

	.form-content {
		display: flex;
		gap: 1rem;
		align-items: flex-end;
	}

	.input-group {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;

		label {
			font-size: 0.8rem;
			color: var(--gray-text);
			font-weight: 500;
		}

		input {
			padding: 0.6rem 1rem;
			border: 0.1rem solid var(--gray-border);
			border-radius: 0.6rem;
			background: var(--gray-bg);
			color: var(--text);
			font-size: 0.8rem;
			transition:
				border-color 0.2s ease,
				box-shadow 0.2s ease,
				background-color 0.2s ease;

			&:focus {
				outline: none;
				border-color: var(--secondary);
				background: var(--surface-base);
				box-shadow: 0 0 0 0.1rem var(--secondary-bg);
			}

			&::placeholder {
				color: var(--gray-text);
				opacity: 0.7;
			}
		}
	}


	@media (max-width: 768px) {
		.form-content {
			flex-direction: column;
			align-items: stretch;
		}

		.submit-btn {
			justify-content: center;
		}
	}
</style>
