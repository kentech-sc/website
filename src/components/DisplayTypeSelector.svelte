<script lang="ts">
	import type { User } from '$lib/types/user.type.js';

	import { createDisplayName } from '$lib/shared/utils.js';
	import { DisplayType } from '$lib/types/user.type.js';

	let {
		user,
		displayType = $bindable<DisplayType>(DisplayType.Anonymous)
	}: {
		user: User;
		displayType?: DisplayType;
	} = $props();
</script>

<div class="display-type-selector container">
	<div class="selector container">
		<input
			type="radio"
			id="anonymous"
			name="displayType"
			value={DisplayType.Anonymous}
			checked
			bind:group={displayType}
		/>
		<label for="anonymous">익명</label>

		<input
			type="radio"
			id="nickname"
			name="displayType"
			value={DisplayType.Nickname}
			bind:group={displayType}
		/>
		<label for="nickname">별명</label>

		<input
			type="radio"
			id="realName"
			name="displayType"
			value={DisplayType.RealName}
			bind:group={displayType}
		/>
		<label for="realName">실명</label>
	</div>
	<span class="display-name">{createDisplayName(user, displayType)}</span>
</div>

<style lang="scss">
	.display-type-selector {
		gap: 0.8rem;
	}

	.display-name {
		font-weight: 600;
		font-size: 0.9rem;
	}

	.selector {
		border: 0.05rem solid var(--gray-border);
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

			&:last-child {
				border-right: none;
			}

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
