<script lang="ts">
	import Clock from '@lucide/svelte/icons/clock';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	import type { ActionResult } from '@sveltejs/kit';

	import ActionForm from '$components/ActionForm.svelte';
	import FormField from '$components/FormField.svelte';

	let formResult = $state<ActionResult | null>(null);

	$effect(() => {
		if (formResult?.type === 'success') {
			const deletedCount = formResult.data?.deletedCount || 0;
			alert(`${deletedCount}개의 파일을 정리했습니다.`);
		}
	});
</script>

<ActionForm actionName="cleanup" formName="cleanup" policy="reload" bind:formResult>
	<h4>
		<Trash2 size="0.8rem" />
		<span>미사용 파일 정리</span>
	</h4>

	<div class="error">
		<div class="container">
			<Clock size="1rem" />
		</div>
		<p>
			지정한 시간 이상 사용되지 않은 파일을 삭제합니다.
			<br />
			이 작업은 되돌릴 수 없습니다.
		</p>
	</div>

	<FormField inputId="cleanup-hours" label="기준 시간 (시간)">
		<input type="number" name="hours" id="cleanup-hours" value="24" min="1" placeholder="24" />
	</FormField>

	<button type="submit" class="ui-button is-danger">
		<Trash2 size="0.8rem" />
		<span>정리하기</span>
	</button>
</ActionForm>

<style lang="scss">
	h4 {
		width: 100%;
		color: var(--error);
		font-weight: 500;
		font-size: 0.9rem;
	}

	.error {
		justify-content: flex-start;
		align-items: flex-start;
		margin-top: 0.6rem;
		margin-bottom: 0.2rem;
		font-size: 0.7rem;

		& > div {
			margin-top: 0.2rem;
			margin-right: 0.4rem;
		}
	}

	button {
		margin-top: 0.6rem;
		margin-left: auto;
	}
</style>
