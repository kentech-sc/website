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
	<div class="form-card">
		<div class="delete-warning">
			<h4>탈퇴 전 주의사항</h4>
			<ul>
				<li>계정 탈퇴는 되돌릴 수 없습니다.</li>
				<li>개인정보는 즉시 파기되지만, 일부 기록 정보는 6개월간 보관됩니다.</li>
				<li>게시글과 댓글은 "탈퇴한 사용자"로 표시됩니다.</li>
				<li>중요한 첨부파일은 탈퇴 전에 직접 삭제해 주세요.</li>
			</ul>
		</div>

		<div class="form-actions-end">
			<button type="button" class="error-btn delete-btn" onclick={handleSubmit}>
				<Trash2 size="1rem" />
				<span>탈퇴하기</span>
			</button>
		</div>
	</div>
	<button hidden type="submit" bind:this={submitBtn}>submit</button>
</CommonForm>

<style lang="scss">
	.delete-warning {
		padding: 1rem;
		background: var(--error-bg);
		border: 0.1rem solid var(--error);
		border-radius: 0.4rem;
		color: var(--error-text);
	}

	.delete-warning h4 {
		margin-bottom: 0.8rem;
		font-size: 1rem;
		font-weight: 600;
	}

	.delete-warning ul {
		padding-left: 1.4rem;
		font-size: 0.8rem;
		line-height: 1.5;
	}

	.delete-warning li + li {
		margin-top: 0.6rem;
	}
</style>
