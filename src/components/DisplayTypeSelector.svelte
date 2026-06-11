<script lang="ts">
	import { DisplayType as DisplayTypeValue, type DisplayType } from '$lib/types/user.type.js';

	let {
		value = $bindable<DisplayType>(DisplayTypeValue.Anonymous),
		name = 'displayType',
		idPrefix = 'display-type'
	}: {
		value?: DisplayType;
		name?: string;
		idPrefix?: string;
	} = $props();
</script>

<div class="display-type-selector">
	<input
		type="radio"
		id={`${idPrefix}-anonymous`}
		{name}
		value={DisplayTypeValue.Anonymous}
		bind:group={value}
	/>
	<label for={`${idPrefix}-anonymous`}>익명</label>

	<input
		type="radio"
		id={`${idPrefix}-nickname`}
		{name}
		value={DisplayTypeValue.Nickname}
		bind:group={value}
	/>
	<label for={`${idPrefix}-nickname`}>별명</label>

	<input
		type="radio"
		id={`${idPrefix}-real-name`}
		{name}
		value={DisplayTypeValue.RealName}
		bind:group={value}
	/>
	<label for={`${idPrefix}-real-name`}>실명</label>
</div>

<style lang="scss">
	.display-type-selector {
		display: flex;
		width: fit-content;
		border: 0.1rem solid var(--gray-border);
		background-color: var(--surface-base);
	}

	input {
		display: none;
	}

	label {
		word-break: keep-all;
		padding: 0.4rem 0.6rem;
		cursor: pointer;
		text-align: center;
		border-right: 0.1rem solid var(--gray-border);
		transition: all 0.2s ease-in-out;

		&:last-child {
			border-right: none;
		}

		&:hover {
			background-color: var(--secondary-bg);
		}
	}

	input:checked + label {
		background-color: var(--secondary);
		color: var(--tertiary-text);
		font-weight: bold;
	}
</style>
