<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Settings2 from '@lucide/svelte/icons/settings-2';

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
		<Settings2 size="1rem" />
		<span><b>학사 기준 설정</b><small>입학연도와 ESP 면제 교과목</small></span>
		<span class="disclosure-icon"><ChevronDown size="0.9rem" /></span>
	</summary>
	<form method="POST" action="?/saveAcademicProfile">
		<label>
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
					<label>
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
		<button class="ui-button is-primary is-compact profile-save"><Check size="0.8rem" />저장</button
		>
	</form>
</details>

<style lang="scss">
	.profile-settings summary {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		cursor: pointer;
		padding: 0.8rem;
		list-style: none;
	}
	.profile-settings summary::-webkit-details-marker {
		display: none;
	}
	.profile-settings summary > span:not(.disclosure-icon),
	.profile-settings label {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.profile-settings summary > :global(svg) {
		color: var(--secondary);
	}
	.disclosure-icon {
		margin-left: auto;
	}
	.profile-settings summary small {
		color: var(--gray-text);
		font-weight: 400;
		font-size: 0.7rem;
	}
	.profile-settings form {
		display: grid;
		grid-template-columns: minmax(8rem, 10rem) minmax(0, 1fr);
		align-items: start;
		gap: 0.8rem 1rem;
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding: 0.8rem;
	}
	.profile-settings label span,
	.esp-waivers legend {
		font-weight: 600;
		font-size: 0.7rem;
	}
	.profile-settings form > label input {
		width: 100%;
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
	.esp-waivers label {
		flex-direction: row;
		align-items: center;
		gap: 0.4rem;
		cursor: pointer;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		background: var(--white);
		padding: 0.2rem 0.4rem;
	}
	.esp-waivers label:has(input:checked) {
		border-color: var(--secondary);
		background: var(--secondary-bg);
	}
	.esp-waivers input {
		flex: 0 0 auto;
	}
	.profile-save {
		grid-column: 2;
		justify-self: end;
	}
	@media (max-width: 600px) {
		.profile-settings form {
			grid-template-columns: 1fr;
		}
		.profile-save {
			grid-column: 1;
		}
	}
</style>
