<script lang="ts">
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import UserRoundX from '@lucide/svelte/icons/user-round-x';

	import CommonForm from '$components/CommonForm.svelte';

	let submitBtn: HTMLButtonElement;
	let loading = $state(false);

	function handleSubmit() {
		if (loading) return;

		const confirmed = confirm('정말로 탈퇴하시겠습니까?');
		if (confirmed) {
			submitBtn?.click();
		}
	}

	function handleSuccess() {
		alert('탈퇴가 완료되었습니다.');
	}
</script>

<CommonForm
	actionName="deleteUser"
	formName="deleteUser"
	policy="reload"
	afterSuccess={handleSuccess}
	bind:loading
>
	<div class="container-col">
		<p>
			<UserRoundX size="0.8rem" />
			<span>계정 탈퇴</span>
		</p>
		<div class="error container-col">
			<h4>탈퇴 전 주의사항</h4>
			<ul>
				<li>계정 탈퇴는 되돌릴 수 없습니다.</li>
				<li>개인정보는 즉시 파기되지만, 일부 기록 정보는 6개월간 보관됩니다.</li>
				<li>게시글과 댓글은 "탈퇴한 사용자"로 표시됩니다.</li>
				<li>중요한 첨부파일은 탈퇴 전에 직접 삭제해 주세요.</li>
			</ul>
		</div>

		<button type="button" class="error-btn" onclick={handleSubmit} disabled={loading}>
			<Trash2 size="0.8rem" />
			<span>탈퇴하기</span>
		</button>
	</div>
	<button hidden type="submit" bind:this={submitBtn} disabled={loading}>submit</button>
</CommonForm>

<style lang="scss">
	p {
		width: 100%;
		color: var(--error);
		font-weight: 500;
		text-align: left;
	}

	.error {
		margin-top: 0.6rem;

		h4 {
			margin: 0.4rem 0;
			font-weight: 600;
			font-size: 0.9rem;
		}

		ul {
			margin-bottom: 0.4rem;
			margin-left: 1rem;
			font-size: 0.7rem;
		}

		li + li {
			margin-top: 0.4rem;
		}
	}

	button {
		margin-top: 0.6rem;
		margin-left: auto;
	}
</style>
