<script lang="ts">
	import DatePicker from './DatePicker.svelte';

	import ActionForm from '$components/ActionForm.svelte';
	import ChoiceTabs from '$components/ChoiceTabs.svelte';
	import FormField from '$components/FormField.svelte';
	import { MEETUP_TITLE_MAX_LENGTH, WEEKDAY_LABELS } from '$lib/shared/meetup.js';
	import { MeetupMode } from '$lib/types/meetup.type.js';

	const MODE_OPTIONS = [
		{ value: MeetupMode.Dates, label: '날짜 지정' },
		{ value: MeetupMode.Weekdays, label: '요일 반복' }
	];
	const HOURS = Array.from({ length: 25 }, (_, hour) => hour);

	let mode = $state<MeetupMode>(MeetupMode.Dates);
	let dates = $state<string[]>([]);
	let weekdays = $state<string[]>([]);
	let startHour = $state(9);
	let endHour = $state(22);
</script>

<ActionForm actionName="create">
	<div class="content-form meetup-form">
		<section class="module">
			<FormField inputId="meetup-title" label="제목">
				<input
					id="meetup-title"
					name="title"
					required
					maxlength={MEETUP_TITLE_MAX_LENGTH}
					placeholder="예: 캡스톤 2차 회의"
				/>
			</FormField>

			<ChoiceTabs name="mode" options={MODE_OPTIONS} bind:value={mode} />

			{#if mode === MeetupMode.Dates}
				<fieldset>
					<legend>후보 날짜</legend>
					<DatePicker name="days" bind:selected={dates} />
				</fieldset>
			{:else}
				<fieldset class="weekday-options">
					<legend>반복할 요일</legend>
					{#each WEEKDAY_LABELS as label, index (label)}
						<label class="choice-option">
							<input type="checkbox" name="days" value={String(index + 1)} bind:group={weekdays} />
							<span>{label}</span>
						</label>
					{/each}
				</fieldset>
			{/if}

			<div class="time-range">
				<label class="form-field">
					<span>시작 시각</span>
					<select name="startHour" bind:value={startHour}>
						{#each HOURS.slice(0, -1) as hour (hour)}
							<option value={hour}>{String(hour).padStart(2, '0')}:00</option>
						{/each}
					</select>
				</label>
				<label class="form-field">
					<span>종료 시각</span>
					<select name="endHour" bind:value={endHour}>
						{#each HOURS.slice(1) as hour (hour)}
							<option value={hour}>{String(hour).padStart(2, '0')}:00</option>
						{/each}
					</select>
				</label>
			</div>
			{#if startHour >= endHour}
				<p class="warn">종료 시각은 시작 시각보다 늦어야 합니다.</p>
			{/if}
		</section>

		<footer>
			<button type="submit" class="ui-button is-primary">만들기</button>
		</footer>
	</div>
</ActionForm>

<style lang="scss">
	fieldset {
		width: 100%;
	}

	.weekday-options {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	legend {
		margin-bottom: 0.2rem;
		padding-left: 0.2rem;
		color: var(--gray-text);
		font-size: 0.7rem;
	}

	.time-range {
		display: flex;
		gap: 0.8rem;
		max-width: 18rem;
	}
</style>
