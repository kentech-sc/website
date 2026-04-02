<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { ActionResult } from '@sveltejs/kit';
	import CommonForm from '$components/CommonForm.svelte';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let submitBtn: HTMLButtonElement;

	function handleSubmit() {
		const confirmed = confirm('정말로 탈퇴하시겠습니까?');
		if (confirmed) {
			submitBtn?.click();
		}
	}

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			alert('탈퇴가 완료되었습니다.');
			invalidateAll();
		}
	});
</script>

<CommonForm actionName="deleteUser" formName="deleteUser" bind:formResult>
	<div class="delete-form">
		<div class="warning-message">
			<div class="warning-content">
				<h4>⚠️ 탈퇴 시 주의사항</h4>
				<ul>
					<li>계정 탈퇴는 되돌릴 수 없습니다</li>
					<li>개인정보는 즉시 파기되나, 식별 정보는 6개월간 보관됩니다</li>
					<li>게시글 및 댓글은 "탈퇴한 사용자"로 표시됩니다</li>
					<li>중요한 정보는 탈퇴 전 직접 삭제하시기 바랍니다</li>
				</ul>
			</div>
		</div>

		<div class="form-actions">
			<button type="button" class="delete-btn" onclick={handleSubmit}>
				<Trash2 size="1rem" />
				<span>탈퇴하기</span>
			</button>
		</div>
	</div>
	<button class="hidden" type="submit" bind:this={submitBtn}>.</button>
</CommonForm>

<style lang="scss">
	.delete-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.warning-message {
		padding: 1rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 0.375rem;
		color: #dc2626;

		h4 {
			margin: 0 0 0.75rem 0;
			font-size: 0.95rem;
			font-weight: 600;
		}

		ul {
			margin: 0;
			padding-left: 1.25rem;
			font-size: 0.875rem;
			line-height: 1.4;

			li {
				margin-bottom: 0.5rem;

				&:last-child {
					margin-bottom: 0;
				}
			}
		}
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
	}

	.delete-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #dc2626;
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;

		&:hover {
			background: #b91c1c;
		}
	}

	@media (max-width: 768px) {
		.form-actions {
			justify-content: stretch;
		}

		.delete-btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
