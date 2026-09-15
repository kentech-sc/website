<script lang="ts" generics="T extends string">
	let {
		name,
		options,
		value = $bindable()
	}: {
		name: string;
		options: Array<{ value: T; label: string }>;
		value: T;
	} = $props();
</script>

<div class="choice-tabs container">
	{#each options as option (option.value)}
		<input
			type="radio"
			id={`${name}-${option.value}`}
			{name}
			value={option.value}
			bind:group={value}
		/>
		<label for={`${name}-${option.value}`}>{option.label}</label>
	{/each}
</div>

<style lang="scss">
	.choice-tabs {
		border: 0.1rem solid var(--gray-border);
		border-radius: 0.2rem;
		background-color: var(--white);
		width: fit-content;
		overflow: hidden;

		input {
			display: none;
		}

		label {
			transition: all 0.2s ease-in-out;
			cursor: pointer;
			padding: 0.2rem 0.6rem;
			font-size: 0.8rem;
			text-align: center;
			word-break: keep-all;

			&:hover {
				background-color: var(--gray-hover);
			}
		}

		input:checked + label {
			background-color: var(--gray-border);
			font-weight: 600;
		}
	}
</style>
