<script lang="ts">
	import AuditForm from './_components/AuditForm.svelte';

	import { resolve } from '$app/paths';
	import CommonHeader from '$components/CommonHeader.svelte';

	let { data } = $props();
</script>

<CommonHeader
	title="감사원 익명 제보"
	description="감사원에만 공개되는 익명 제보를 접수하는 공간입니다."
>
	{#if data.canManage}
		<a class="action-btn" href={resolve('/channel/audit/manage')}>접수함</a>
	{/if}
</CommonHeader>

<p class="module privacy-note">
	제보에는 계정이나 작성자 식별 정보를 저장하지 않습니다. 제출 후에는 작성자가 내용을 다시
	열람하거나 수정할 수 없습니다.
</p>

<AuditForm />

<style>
	.privacy-note {
		margin-bottom: 1rem;
		font-size: 0.8rem;
	}
</style>
