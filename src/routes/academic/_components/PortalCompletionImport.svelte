<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Clipboard from '@lucide/svelte/icons/clipboard';
	import Upload from '@lucide/svelte/icons/upload';

	import RecordEntryDialog from './RecordEntryDialog.svelte';

	import type { Course } from '$lib/types/course.type.js';

	import { isApCreditCode } from '$lib/shared/academic-credit.js';
	import {
		KIS_COMPLETION_EXTRACTOR,
		parsePortalCompletionText
	} from '$lib/shared/portal-completion-import.js';

	let {
		courses,
		form
	}: {
		courses: Course[];
		form?: {
			importedCount?: number;
			failedCount?: number;
			withdrawnCount?: number;
			frFallbackCodes?: string[];
			skippedCount?: number;
			message?: string;
		} | null;
	} = $props();

	let portalData = $state('');
	let scriptCopied = $state(false);
	let importOpen = $state(false);
	const parsed = $derived(parsePortalCompletionText(portalData));
	const courseIds = $derived(new Set(courses.map((course) => course.id)));
	const matchedRows = $derived(
		parsed.rows.filter((row) => courseIds.has(row.courseId) || isApCreditCode(row.courseId))
	);
	const frFallbackRows = $derived(
		parsed.rows.filter((row) => !courseIds.has(row.courseId) && !isApCreditCode(row.courseId))
	);

	async function copyExtractor() {
		await navigator.clipboard.writeText(KIS_COMPLETION_EXTRACTOR);
		scriptCopied = true;
		setTimeout(() => (scriptCopied = false), 2000);
	}

	function termLabel(term: number) {
		return ['1학기', '2학기', '하계', '동계'][term - 1];
	}

	$effect(() => {
		if (form?.importedCount) importOpen = true;
	});
</script>

<RecordEntryDialog
	title="KIS에서 한 번에 가져오기"
	description="여러 학기의 수강 이력을 빠르게 등록합니다"
	emphasis
	bind:open={importOpen}
>
	{#snippet icon()}<Upload size="1rem" />{/snippet}
	<div class="import-body">
		<ol class="guide">
			<li>
				<div>
					<b>추출 스크립트 복사</b>
					<p>아래 버튼을 눌러 필요한 스크립트를 복사합니다.</p>
					<button type="button" class="copy-button" onclick={copyExtractor}>
						{#if scriptCopied}<Check size="0.95rem" />복사 완료{:else}<Clipboard
								size="0.95rem"
							/>스크립트 복사{/if}
					</button>
				</div>
			</li>
			<li>
				<div>
					<b>전체성적조회 열기</b>
					<p>
						<a href="https://kis.kentech.ac.kr/main.do" target="_blank" rel="noreferrer"
							>KIS를 새 탭에서 열어</a
						>
						로그인한 뒤 전체성적조회 화면으로 이동합니다.
					</p>
				</div>
			</li>
			<li>
				<div>
					<b>Console 열기</b>
					<p><kbd>F12</kbd>를 누르고 개발자 도구 위쪽의 <b>Console</b> 탭을 선택합니다.</p>
				</div>
			</li>
			<li>
				<div>
					<b>스크립트 실행</b>
					<p>Console에서 <kbd>Ctrl</kbd>+<kbd>V</kbd>로 붙여넣고 Enter를 누릅니다.</p>
					<small>
						붙여넣기가 막히면 <code>allow pasting</code>을 직접 입력하고 Enter를 누른 뒤 다시
						붙여넣으세요.
					</small>
				</div>
			</li>
		</ol>

		<section class="result-section">
			<header class="result-heading">
				<span>5</span>
				<div>
					<b>결과 붙여넣기</b>
					<p>복사한 결과를 아래 칸에 붙여 넣고, 과목을 확인한 뒤 등록합니다.</p>
				</div>
			</header>

			<form method="POST" action="?/importCompletions">
				<label for="portal-data">추출 결과</label>
				<textarea
					id="portal-data"
					name="portalData"
					rows="6"
					bind:value={portalData}
					placeholder="Console에서 복사된 결과를 여기에 붙여 넣으세요."></textarea>

				{#if portalData.trim()}
					{#if matchedRows.length}
						<section class="confirmed-results" aria-live="polite">
							<header><b>확인된 과목</b><span>{matchedRows.length}개</span></header>
							<ul class="preview-list">
								{#each matchedRows as row (`${row.courseId}-${row.year}-${row.term}`)}
									<li>
										<span><b>{row.courseId}</b> {row.courseName}</span>
										<span>{row.year} {termLabel(row.term)} · {row.grade}</span>
									</li>
								{/each}
							</ul>
						</section>
					{/if}
					{#if frFallbackRows.length || parsed.skippedCount}
						<div class="preview-summary">
							{#if frFallbackRows.length}<span>{frFallbackRows.length}개 강의 정보 없음</span>{/if}
							{#if parsed.skippedCount}<span>{parsed.skippedCount}개 제외</span>{/if}
						</div>
					{/if}
					{#if frFallbackRows.length}
						<p class="note">
							강의 정보가 없어 자유선택(FR)으로 등록됨: {[
								...new Set(frFallbackRows.map((row) => row.courseId))
							].join(', ')}
						</p>
					{/if}
				{/if}

				<button class="submit-button" disabled={!matchedRows.length && !frFallbackRows.length}
					>확인한 {matchedRows.length + frFallbackRows.length}개 과목 등록</button
				>
			</form>
		</section>

		{#if form?.importedCount}
			<p class="success" aria-live="polite">
				{form.importedCount}개 수강 이력을 반영했습니다.{form.failedCount
					? ` 낙제 ${form.failedCount}개 포함.`
					: ''}{form.withdrawnCount ? ` 철회 ${form.withdrawnCount}개 포함.` : ''}
			</p>
			{#if form.frFallbackCodes?.length}<p class="note">
					강의 정보가 없어 자유선택(FR)으로 등록됨: {form.frFallbackCodes.join(', ')}
				</p>{/if}
		{:else if form?.message}
			<p class="warning" aria-live="polite">{form.message}</p>
		{/if}
	</div>
</RecordEntryDialog>

<style lang="scss">
	.preview-summary,
	.preview-list li,
	.copy-button {
		display: flex;
		align-items: center;
	}
	.import-body,
	.import-body form {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}
	.import-body {
		padding: 0;
	}
	.guide {
		counter-reset: guide;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.guide > li {
		display: grid;
		position: relative;
		grid-template-columns: 1.55rem minmax(0, 1fr);
		gap: 0.55rem;
		counter-increment: guide;
		padding: 0 0 0.75rem;
		color: var(--gray-text);
		font-size: 0.74rem;
	}
	.guide > li::before {
		display: grid;
		place-items: center;
		z-index: 1;
		border: var(--control-border-width) solid
			color-mix(in srgb, var(--secondary) 35%, var(--gray-border));
		border-radius: 50%;
		background: var(--white);
		width: 1.55rem;
		height: 1.55rem;
		content: counter(guide);
		color: var(--secondary);
		font-weight: 700;
		font-size: 0.68rem;
	}
	.guide > li:not(:last-child)::after {
		position: absolute;
		top: 1.55rem;
		bottom: 0;
		left: calc(0.775rem - var(--divider-border-width) / 2);
		border-left: var(--divider-border-width) solid var(--gray-border);
		content: '';
	}
	.guide > li > div {
		min-width: 0;
	}
	.guide b,
	.guide p {
		margin: 0;
	}
	.guide > li > div > b {
		display: block;
		margin: 0.1rem 0 0.08rem;
		color: var(--text);
		font-size: 0.77rem;
	}
	.guide p {
		line-height: 1.45;
	}
	.guide a {
		color: var(--secondary);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 0.12rem;
	}
	.guide code {
		border-radius: 0.22rem;
		background: var(--gray-bg);
		padding: 0.08rem 0.25rem;
		color: var(--text);
		font-size: 0.7rem;
	}
	.guide kbd {
		border-radius: 0.22rem;
		background: var(--gray-bg);
		padding: 0.08rem 0.25rem;
		color: var(--text);
		font-size: 0.7rem;
		font-family: inherit;
	}
	.guide small {
		display: block;
		margin-top: 0.2rem;
		color: var(--error-text);
		font-size: 0.66rem;
	}
	.copy-button {
		align-self: flex-start;
		gap: 0.3rem;
		margin-top: 0.4rem;
		border-color: color-mix(in srgb, var(--secondary) 35%, var(--gray-border));
		color: var(--secondary);
		font-size: 0.72rem;
	}
	.result-section {
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding-top: 0.75rem;
	}
	.result-heading {
		display: grid;
		grid-template-columns: 1.55rem minmax(0, 1fr);
		gap: 0.55rem;
	}
	.result-heading > span {
		display: grid;
		place-items: center;
		border: var(--control-border-width) solid
			color-mix(in srgb, var(--secondary) 35%, var(--gray-border));
		border-radius: 50%;
		background: var(--white);
		width: 1.55rem;
		height: 1.55rem;
		color: var(--secondary);
		font-weight: 700;
		font-size: 0.68rem;
	}
	.result-heading b,
	.result-heading p {
		margin: 0;
	}
	.result-heading b {
		display: block;
		margin: 0.1rem 0 0.08rem;
		font-size: 0.77rem;
	}
	.result-heading p {
		color: var(--gray-text);
		font-size: 0.74rem;
		line-height: 1.45;
	}
	.result-section form {
		margin-top: 0.6rem;
	}
	label {
		font-weight: 600;
		font-size: 0.82rem;
	}
	textarea {
		background: var(--white);
		width: 100%;
		resize: vertical;
		line-height: 1.5;
		font-family: monospace;
	}
	.preview-summary {
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.preview-summary span {
		border-radius: 999px;
		background: var(--gray-bg);
		padding: 0.25rem 0.5rem;
		color: var(--gray-text);
		font-size: 0.75rem;
	}
	.confirmed-results {
		border: var(--divider-border-width) solid var(--gray-border);
		border-radius: 0.5rem;
		background: var(--white);
		overflow: hidden;
	}
	.confirmed-results > header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		padding: 0.45rem 0.55rem;
		font-size: 0.74rem;
	}
	.confirmed-results > header span {
		color: var(--success-text);
		font-weight: 600;
		font-size: 0.68rem;
	}
	.preview-list {
		margin: 0;
		padding: 0 0.55rem;
		max-height: 13rem;
		overflow: auto;
		list-style: none;
	}
	.preview-list li {
		justify-content: space-between;
		gap: 0.75rem;
		border-bottom: var(--divider-border-width) solid var(--gray-border);
		padding: 0.4rem 0;
		font-size: 0.76rem;
	}
	.preview-list li span:last-child {
		flex-shrink: 0;
		color: var(--gray-text);
	}
	.warning,
	.success,
	.note {
		margin: 0;
		font-size: 0.78rem;
	}
	.warning {
		color: var(--error-text);
	}
	.success {
		color: var(--success-text);
	}
	.note {
		color: var(--info-text);
	}
	.submit-button {
		align-self: flex-end;
		border-color: var(--secondary);
		background: var(--secondary);
		color: white;
	}
	@media (max-width: 680px) {
		.preview-list li {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.15rem;
		}
	}
</style>
