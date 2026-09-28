<script lang="ts">
	import Bell from '@lucide/svelte/icons/bell';
	import Send from '@lucide/svelte/icons/send';

	import type { ActionResult } from '@sveltejs/kit';

	import ActionForm from '$components/ActionForm.svelte';
	import FormField from '$components/FormField.svelte';

	let formResult = $state<ActionResult | null>(null);
	let testLoading = $state(false);

	function handleSuccess() {
		const result = formResult?.type === 'success' ? formResult.data?.pushResult : null;
		const sentCount = Number(result?.sentCount ?? 0);
		(document.getElementById('sendPush') as HTMLFormElement | null)?.reset();
		alert(`${sentCount}개의 기기에 푸시 알림을 보냈습니다.`);
	}

	async function sendTestPush() {
		const form = document.getElementById('sendPush') as HTMLFormElement | null;
		if (!form || !form.reportValidity() || testLoading) return;

		const formData = new FormData(form);
		testLoading = true;
		try {
			const response = await fetch('/api/push/test', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					title: formData.get('title'),
					body: formData.get('body')
				})
			});
			const result = (await response.json()) as { message?: string; sentCount?: number };
			if (!response.ok) throw new Error(result.message ?? '테스트 푸시 발송에 실패했습니다.');

			alert(`내 기기 ${result.sentCount ?? 0}개에 테스트 푸시를 보냈습니다.`);
		} catch (error) {
			alert(error instanceof Error ? error.message : '테스트 푸시 발송에 실패했습니다.');
		} finally {
			testLoading = false;
		}
	}
</script>

<ActionForm actionName="sendPush" formName="sendPush" bind:formResult afterSuccess={handleSuccess}>
	<h4>
		<Send size="0.8rem" />
		<span>푸시 알림 보내기</span>
	</h4>

	<p>푸시 알림을 허용한 모든 기기에 공지를 보냅니다.</p>

	<FormField inputId="push-title" label="제목">
		<input id="push-title" name="title" type="text" required maxlength="80" />
	</FormField>

	<FormField inputId="push-body" label="내용">
		<textarea id="push-body" name="body" rows="4" required maxlength="500"></textarea>
	</FormField>

	<div class="actions">
		<button
			type="button"
			class="ui-button is-secondary"
			onclick={sendTestPush}
			disabled={testLoading}
		>
			<Bell size="0.8rem" />
			<span>{testLoading ? '테스트 중...' : '나에게 테스트'}</span>
		</button>
		<button type="submit" class="ui-button is-primary" disabled={testLoading}>
			<Send size="0.8rem" />
			<span>전체 발송</span>
		</button>
	</div>
</ActionForm>

<style lang="scss">
	h4 {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		color: var(--secondary);
		font-weight: 500;
		font-size: 0.9rem;
	}

	p {
		margin-top: 0.2rem;
		color: var(--gray);
		font-size: 0.7rem;
	}

	textarea {
		resize: vertical;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.4rem;
		margin-top: 0.6rem;
	}
</style>
