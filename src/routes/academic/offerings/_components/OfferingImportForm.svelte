<script lang="ts">
	import Calendar from '@lucide/svelte/icons/calendar-days';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import Upload from '@lucide/svelte/icons/upload-cloud';

	let year = $state(new Date().getFullYear());
	let term = $state(1);
	let fileName = $state('');

	const detectTerm = (event: Event) => {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		fileName = file.name;
		const yearMatch = file.name.match(/20\d{2}/);
		if (yearMatch) year = Number(yearMatch[0]);
		if (/(하계|여름)/.test(file.name)) term = 3;
		else if (/(동계|겨울)/.test(file.name)) term = 4;
		else {
			const termMatch = file.name.match(/20\d{2}[_\s-]*(\d)\s*학기/i);
			if (termMatch) term = Number(termMatch[1]);
		}
	};
</script>

<form
	method="POST"
	action="?/importOfferings"
	enctype="multipart/form-data"
	class="module import-form"
>
	<label class="file-drop">
		<span class="file-icon"><FileSpreadsheet size="1.45rem" /></span>
		<span class="file-copy">
			<b>{fileName || '개설교과목 엑셀 선택'}</b>
			<small>
				{fileName
					? '다른 파일을 선택하려면 다시 누르세요.'
					: '학교에서 내려받은 .xlsx 파일을 그대로 사용할 수 있습니다.'}
			</small>
		</span>
		<span class="ui-button is-secondary choose-button">
			<Upload size="0.9rem" />파일 선택
		</span>
		<input
			type="file"
			name="workbook"
			accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			required
			onchange={detectTerm}
		/>
	</label>

	<section class="term-section">
		<header class="section-heading">
			<Calendar size="1rem" />
			<div>
				<h2>적용 학기</h2>
				<p>파일명에서 자동으로 찾았지만, 적용 전에 꼭 확인하세요.</p>
			</div>
		</header>
		<div class="term-fields">
			<label>
				<span>개설 연도</span>
				<input type="number" name="year" min="2022" max="2100" bind:value={year} required />
			</label>
			<label>
				<span>학기</span>
				<select name="term" bind:value={term} required>
					<option value={1}>1학기</option>
					<option value={2}>2학기</option>
					<option value={3}>하계학기</option>
					<option value={4}>동계학기</option>
				</select>
			</label>
		</div>
	</section>

	<details class="import-rules">
		<summary>가져올 때 적용되는 기준</summary>
		<ul>
			<li>파일명의 연도와 학기를 자동 입력하며, 관리자가 직접 수정할 수 있습니다.</li>
			<li>학부·대학원 형식을 자동 판별하며, 같은 과정의 해당 학기 강의만 갱신합니다.</li>
			<li>대표교수가 여러 명이면 모두 해당 개설 강의의 교수로 저장합니다.</li>
			<li>P 과목은 개별 학점을 0으로 보존하며 ESP 단계 이수 규칙으로 졸업학점에 반영합니다.</li>
			<li>폐강 표시 또는 폐강일자가 있는 강의는 가져오지 않습니다.</li>
		</ul>
	</details>

	<button class="ui-button is-primary submit-button" disabled={!fileName}>
		<Upload size="0.95rem" />이 학기의 개설 강의 반영
	</button>
</form>

<style lang="scss">
	.import-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border-radius: 0.8rem;
		padding: 1rem;
	}

	.file-drop {
		display: grid;
		position: relative;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.8rem;
		cursor: pointer;
		border: var(--divider-border-width) dashed
			color-mix(in srgb, var(--secondary) 55%, var(--gray-border));
		border-radius: 0.7rem;
		background: color-mix(in srgb, var(--secondary) 3%, var(--white));
		padding: 1.2rem;
	}

	.file-drop:hover {
		background: color-mix(in srgb, var(--secondary) 6%, var(--white));
	}

	.file-drop input {
		position: absolute;
		opacity: 0;
		width: 0.1rem;
		height: 0.1rem;
	}

	.file-icon {
		display: grid;
		place-items: center;
		border-radius: 0.6rem;
		background: color-mix(in srgb, var(--secondary) 10%, var(--white));
		width: 2.8rem;
		height: 2.8rem;
		color: var(--secondary);
	}

	.file-copy {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.file-copy b {
		font-size: 0.9rem;
	}

	.file-copy small,
	.section-heading p {
		color: var(--gray-text);
		font-size: 0.7rem;
	}

	.term-section {
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding-top: 1rem;
	}

	.section-heading {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.section-heading > :global(svg) {
		color: var(--secondary);
	}

	.section-heading h2,
	.section-heading p {
		margin: 0;
	}

	.section-heading h2 {
		font-size: 0.9rem;
	}

	.term-fields {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
		margin-top: 0.6rem;
	}

	.term-fields label {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.term-fields span {
		font-weight: 600;
		font-size: 0.7rem;
	}

	.import-rules {
		border-radius: 0.6rem;
		background: var(--gray-bg);
		padding: 0.6rem 0.8rem;
	}

	.import-rules summary {
		cursor: pointer;
		font-weight: 600;
		font-size: 0.7rem;
	}

	.import-rules ul {
		margin: 0.6rem 0 0;
		padding-left: 1rem;
		color: var(--gray-text);
		font-size: 0.7rem;
		line-height: 1.6;
	}

	.submit-button {
		align-self: flex-end;
	}

	@media (width <= 600px) {
		.file-drop {
			grid-template-columns: auto 1fr;
		}

		.choose-button {
			grid-column: 1 / -1;
			justify-content: center;
		}

		.term-fields {
			grid-template-columns: 1fr;
		}

		.submit-button {
			justify-content: center;
			align-self: stretch;
		}
	}
</style>
