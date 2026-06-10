<script lang="ts">
	import Trash2 from '@lucide/svelte/icons/trash-2';

	import type { ActionResult } from '@sveltejs/kit';

	import { invalidateAll } from '$app/navigation';
	import CommonForm from '$components/CommonForm.svelte';

	let submitBtn: HTMLButtonElement;
	let formResult = $state<ActionResult | null>(null);

	function handleSubmit() {
		const confirmed = confirm('정말로 탈퇴하시겠습니까?');
		if (confirmed) {
			submitBtn?.click();
		}
	}

	$effect(() => {
		if (formResult?.type === 'success') {
			alert('탈퇴가 완료되었습니다.');
			invalidateAll();
		}
	});
</script>

<CommonForm actionName="deleteUser" formName="deleteUser" bind:formResult>
	<div class="delete-form">
		<div class="warning-message error">
			<div class="warning-content">
				<h4>탈퇴 전 주의사항</h4>
				<ul>
					<li>계정 탈퇴는 되돌릴 수 없습니다.</li>
					<li>개인정보는 즉시 파기되나, 일부 기록 정보는 6개월간 보관됩니다.</li>
					<li>게시글 및 댓글은 "탈퇴한 사용자"로 표시됩니다.</li>
					<li>중요한 첨부파일은 탈퇴 전 직접 삭제해 주시기 바랍니다.</li>
				</ul>
			</div>
		</div>

		<div class="form-actions">
			<button type="button" class="delete-btn error-btn" onclick={handleSubmit}>
				<Trash2 size="1rem" />
				<span>탈퇴하기</span>
			</button>
		</div>
	</div>
	<button hidden type="submit" bind:this={submitBtn}>submit</button>
</CommonForm>

<style lang="scss">
	.delete-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.warning-message {
		padding: 1rem;

		h4 {
			margin: 0 0 0.8rem;
			font-size: 1rem;
			font-weight: 600;
		}

		ul {
			margin: 0;
			padding-left: 1.4rem;
			font-size: 0.8rem;
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
