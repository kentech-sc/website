<script lang="ts">
	import CheckCircle from '@lucide/svelte/icons/circle-check-big';

	type ImportResult = {
		importedCount?: number;
		academicCareer?: 'undergraduate' | 'graduate';
		newOfferingCount?: number;
		scheduleChanged?: number;
		detailsChanged?: number;
		cancelled?: number;
		unconfirmedTimetableCount?: number;
		skippedClosedCount?: number;
		passCreditCount?: number;
		multipleProfessorCount?: number;
		message?: string;
	} | null;

	let { result }: { result: ImportResult } = $props();
</script>

{#if result?.importedCount}
	<div class="result-card" aria-live="polite">
		<CheckCircle size="1.25rem" />
		<div>
			<strong>
				{result.academicCareer === 'graduate' ? '대학원' : '학부'}
				{result.importedCount}개 개설 강의를 반영했습니다.
			</strong>
			<div class="result-details">
				{#if result.newOfferingCount}<span>신규 분반 {result.newOfferingCount}</span>{/if}
				{#if result.scheduleChanged}<span>시간 변경 {result.scheduleChanged}</span>{/if}
				{#if result.detailsChanged}<span>정보 변경 {result.detailsChanged}</span>{/if}
				{#if result.cancelled}<span>폐강 반영 {result.cancelled}</span>{/if}
				{#if result.unconfirmedTimetableCount}<span
						>확정 취소 {result.unconfirmedTimetableCount}</span
					>{/if}
				{#if result.skippedClosedCount && result.skippedClosedCount !== result.cancelled}
					<span>파일 내 폐강 행 {result.skippedClosedCount}</span>
				{/if}
				{#if result.passCreditCount}<span>P 과목 {result.passCreditCount}</span>{/if}
				{#if result.multipleProfessorCount}<span>복수 교수 {result.multipleProfessorCount}</span
					>{/if}
			</div>
		</div>
	</div>
{/if}

{#if result?.message}<p class="error-message" aria-live="polite">{result.message}</p>{/if}

<style lang="scss">
	.result-card {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		border: var(--control-border-width) solid var(--success);
		border-radius: 0.8rem;
		background: var(--white);
		padding: 0.8rem;
		color: var(--success-text);
	}

	.result-card > div {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.result-card strong {
		font-size: 0.7rem;
	}

	.result-details {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.result-details span {
		border-radius: 999px;
		background: var(--success-bg);
		padding: 0.2rem 0.4rem;
		font-size: 0.7rem;
	}

	.error-message {
		margin: 0;
		border-radius: 0.4rem;
		background: var(--error-bg);
		padding: 0.8rem;
		color: var(--error-text);
		font-size: 0.7rem;
	}
</style>
