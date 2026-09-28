<script lang="ts">
	import type { DiningSlot } from '$lib/types/dining.type.js';
	import type { DiningNotificationPreferences } from '$lib/types/push-subscription.type.js';
	let {
		preferences,
		disabled,
		onChange
	}: {
		preferences: DiningNotificationPreferences;
		disabled: boolean;
		onChange: (slot: DiningSlot, enabled: boolean) => void;
	} = $props();
	const slots: { id: DiningSlot; label: string }[] = [
		{ id: 'breakfast', label: '조식' },
		{ id: 'lunch', label: '중식' },
		{ id: 'dinner', label: '석식' }
	];
</script>

<fieldset class="dining-preferences" {disabled}>
	<legend>학식 알림</legend>
	<p>이 기기에서 받고 싶은 식사 알림을 선택하세요.</p>
	<div class="preference-options">
		{#each slots as slot (slot.id)}<label class="choice-option"
				><input
					type="checkbox"
					checked={preferences[slot.id]}
					onchange={(event) => onChange(slot.id, event.currentTarget.checked)}
				/><span>{slot.label}</span></label
			>{/each}
	</div>
</fieldset>

<style lang="scss">
	.dining-preferences {
		margin-top: 0.8rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		padding: 0.6rem;
		width: 100%;
	}

	.dining-preferences legend {
		padding: 0 0.2rem;
		font-weight: 600;
		font-size: 0.7rem;
	}

	.dining-preferences p {
		margin: 0 0 0.5rem;
	}

	.preference-options {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.4rem;
	}
</style>
