<script lang="ts">
	import InlineActionForm from '$components/InlineActionForm.svelte';
	import { SubmissionStatus, type SubmissionPermissions } from '$lib/types/submission.type.js';

	let {
		submissionId,
		status,
		permissions
	}: {
		submissionId: string;
		status: SubmissionStatus;
		permissions: SubmissionPermissions;
	} = $props();

	const hiddenFields = $derived([{ name: 'submission-id', value: submissionId }]);
	const policy = { kind: 'detail' as const, notFoundRedirectTo: '/channel/petitions' };
</script>

{#if status === SubmissionStatus.Pending && permissions.canReview}
	<section class="module">
		<InlineActionForm actionName="startReview" {hiddenFields} {policy}>검토 시작</InlineActionForm>
	</section>
{:else if status === SubmissionStatus.Reviewing && permissions.canCancelReview}
	<section class="module">
		<InlineActionForm actionName="cancelReview" {hiddenFields} {policy}>검토 취소</InlineActionForm>
	</section>
{:else if status === SubmissionStatus.Ongoing}
	<section class="module"><p>30일 안에 10명 이상이 동의하면 검토 대기 상태가 됩니다.</p></section>
{:else if status === SubmissionStatus.Expired}
	<section class="module"><p>청원 기간이 만료되었습니다.</p></section>
{/if}

<style lang="scss">
	p {
		font-size: 0.9rem;
	}
</style>
