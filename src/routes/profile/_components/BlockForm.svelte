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
		<div class="form-card">
			<div class="form-card-header">
				<Ban size="1rem" />
				<span>사용자 차단</span>
			</div>

			<div class="form-card-body">
				<div class="field-group">
					<label for="block-email">차단할 사용자의 이메일</label>
					<input
						type="text"
						name="email"
						id="block-email"
						placeholder="user@example.com"
						required
					/>
				</div>

				<div class="field-group">
					<label for="block-duration">차단 기간 (분)</label>
					<input
						type="number"
						name="duration"
						id="block-duration"
						placeholder="60"
						min="1"
						required
					/>
				</div>

				<div class="form-actions-end">
					<button type="submit" class="error-btn">
						<Ban size="1rem" />
						<span>차단하기</span>
					</button>
				</div>
			</div>
		</div>
	</CommonForm>

	<CommonForm actionName="unblockUser" formName="unblockUser" bind:formResult>
		<div class="form-card">
			<div class="form-card-header">
				<ShieldCheck size="1rem" />
				<span>차단 해제</span>
			</div>

			<div class="form-card-body">
				<div class="field-group">
					<label for="unblock-email">차단 해제할 사용자의 이메일</label>
					<input
						type="text"
						name="email"
						id="unblock-email"
						placeholder="user@example.com"
						required
					/>
				</div>

				<div class="form-actions-end">
					<button type="submit" class="success-btn">
						<ShieldCheck size="1rem" />
						<span>차단 해제하기</span>
					</button>
				</div>
			</div>
		</div>
	</CommonForm>
</div>

<style lang="scss">
	.admin-forms {
		display: flex;
		flex-direction: column;
		gap: 1.6rem;
	}
</style>
