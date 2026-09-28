<script lang="ts">
	import BookOpenCheck from '@lucide/svelte/icons/book-open-check';
	import Search from '@lucide/svelte/icons/search';

	import CourseRecordHistory from './CourseRecordHistory.svelte';
	import ManualRecordDialog from './ManualRecordDialog.svelte';
	import PortalRecordImport from './PortalRecordImport.svelte';
	import SectionHeading from './SectionHeading.svelte';

	import type { ActionData, PageData } from '../$types.js';

	let {
		records,
		courses,
		profile,
		form
	}: {
		records: PageData['records'];
		courses: PageData['courses'];
		profile: PageData['academicProfile'];
		form: ActionData;
	} = $props();
	let historyQuery = $state('');

	const filteredRecords = $derived(
		records.filter((record) =>
			`${record.courseCode} ${record.courseName} ${record.year}`
				.toLowerCase()
				.includes(historyQuery.trim().toLowerCase())
		)
	);
</script>

{#if profile}
	<section class="module" id="course-history">
		<header>
			<SectionHeading
				icon={BookOpenCheck}
				title="수강 내역"
				description="직접 등록한 내용을 기준으로 계산합니다."
			/>
			<label class="records-search">
				<Search size="0.9rem" />
				<input
					type="search"
					bind:value={historyQuery}
					placeholder="과목명·코드 검색"
					aria-label="수강 내역 검색"
				/>
			</label>
		</header>

		<div class="record-entry-tools">
			<PortalRecordImport {courses} {form} />
			<ManualRecordDialog {courses} />
		</div>

		<CourseRecordHistory
			records={filteredRecords}
			query={historyQuery}
			hideGrades={profile.hideGrades ?? false}
		/>
	</section>
{/if}

<style lang="scss">
	section {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 0.6rem;
	}

	.records-search {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 1.4rem;
		padding-left: 0.6rem;
		color: var(--gray-text);
	}
	.records-search input {
		border: 0;
		width: 11rem;
	}
	.record-entry-tools {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		align-items: start;
		gap: 0.6rem;
	}
	@media (width <= 850px) {
		.record-entry-tools {
			grid-template-columns: 1fr;
		}
	}
	@media (width <= 600px) {
		.records-search input {
			width: 100%;
		}
	}
</style>
