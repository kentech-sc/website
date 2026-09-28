<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Settings2 from '@lucide/svelte/icons/settings-2';

	import SectionHeading from './SectionHeading.svelte';

	import type { PageData } from '../$types.js';

	let {
		profile,
		espCourses
	}: {
		profile: PageData['academicProfile'];
		espCourses: PageData['espCourses'];
	} = $props();
</script>

<details class="module is-flush profile-settings" open={!profile}>
	<summary>
		<SectionHeading
			icon={Settings2}
			title="학사 기준 설정"
			description="입학연도와 ESP 면제 교과목"
		/>
		<span class="disclosure-icon"><ChevronDown size="0.9rem" /></span>
	</summary>
	<form method="POST" action="?/saveAcademicProfile">
		<label class="form-field">
			<span>입학연도</span>
			<input
				type="number"
				name="admissionYear"
				min="2022"
				max="2100"
				value={profile?.admissionYear ?? new Date().getFullYear()}
				required
			/>
		</label>
		<fieldset class="esp-waivers">
			<legend>ESP 면제 교과목</legend>
			<p>배치 결과로 수강하지 않아도 되는 과목만 선택하세요.</p>
			<div>
				{#each espCourses as course (course.id)}
					<label class="choice-option">
						<input
							type="checkbox"
							name="espWaivedCourseIds"
							value={course.id}
							checked={profile?.espWaivedCourseIds.includes(course.id) ?? false}
						/>
						<span>{course.name}</span>
					</label>
				{/each}
			</div>
		</fieldset>
		<button class="ui-button is-primary profile-save"><Check size="0.8rem" />저장</button>
	</form>
</details>

<style lang="scss">
	.disclosure-icon {
		margin-left: auto;
	}
	.profile-settings form {
		display: grid;
		grid-template-columns: minmax(8rem, 10rem) minmax(0, 1fr);
		align-items: start;
		gap: 0.8rem 1rem;
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding: 0.8rem;
	}
	.esp-waivers legend {
		font-weight: 600;
		font-size: 0.7rem;
	}
	.esp-waivers > p {
		margin: 0.2rem 0 0.4rem;
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.esp-waivers > div {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.profile-save {
		grid-column: 2;
		justify-self: end;
	}
	@media (width <= 600px) {
		.profile-settings form {
			grid-template-columns: 1fr;
		}
		.profile-save {
			grid-column: 1;
		}
	}
</style>
