<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
</script>

<button class="gsi-material-button" onclick={() => signIn('google')}>
	<div class="gsi-material-button-state"></div>
	<div class="gsi-material-button-content-wrapper">
		<div class="gsi-material-button-icon">
			<svg
				version="1.1"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 48 48"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				style="display: block;"
			>
				<path
					fill="#EA4335"
					d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
				></path>
				<path
					fill="#4285F4"
					d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
				></path>
				<path
					fill="#FBBC05"
					d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
				></path>
				<path
					fill="#34A853"
					d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
				></path>
				<path fill="none" d="M0 0h48v48H0z"></path>
			</svg>
		</div>
		<span class="gsi-material-button-contents">Sign in with Google</span>
		<span style="display: none;">Sign in with Google</span>
	</div>
</button>

<style>
	.gsi-material-button {
		position: relative;
		vertical-align: middle;
		appearance: none;
		-webkit-appearance: none;
		-webkit-transition:
			background-color 0.218s,
			border-color 0.218s,
			box-shadow 0.218s;
		transition:
			background-color 0.218s,
			border-color 0.218s,
			box-shadow 0.218s;
		cursor: pointer;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		outline: none;
		border: calc(1rem / 16) solid #747775;
		-webkit-border-radius: calc(20rem / 16);
		border-radius: calc(10rem / 16);
		background-image: none;
		background-color: WHITE;
		padding: 0 calc(12rem / 16);
		width: auto;
		min-width: min-content;
		max-width: 400px;
		height: calc(40rem / 16);
		overflow: hidden;
		color: #1f1f1f;
		font-size: calc(14rem / 16);
		font-family: 'Roboto', arial, sans-serif;
		letter-spacing: calc(0.25rem / 16);
		user-select: none;

		-moz-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
		text-align: center;
		white-space: nowrap;
	}

	.gsi-material-button .gsi-material-button-icon {
		margin-right: calc(12rem / 16);
		width: calc(20rem / 16);
		min-width: calc(20rem / 16);
		height: calc(20rem / 16);
	}

	.gsi-material-button .gsi-material-button-content-wrapper {
		display: flex;
		position: relative;
		-webkit-flex-direction: row;
		flex-direction: row;
		-webkit-flex-wrap: nowrap;
		flex-wrap: nowrap;
		justify-content: space-between;
		-webkit-align-items: center;
		align-items: center;
		width: 100%;
		height: 100%;
	}

	.gsi-material-button .gsi-material-button-contents {
		-webkit-flex-grow: 1;
		flex-grow: 1;
		vertical-align: top;
		overflow: hidden;
		font-weight: 500;
		font-family: 'Roboto', arial, sans-serif;
		text-overflow: ellipsis;
	}

	.gsi-material-button .gsi-material-button-state {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		opacity: 0;
		-webkit-transition: opacity 0.218s;
		transition: opacity 0.218s;
	}

	.gsi-material-button:disabled {
		cursor: default;
		border-color: #1f1f1f1f;
		background-color: #ffffff61;
	}

	.gsi-material-button:disabled .gsi-material-button-contents {
		opacity: 38%;
	}

	.gsi-material-button:disabled .gsi-material-button-icon {
		opacity: 38%;
	}

	.gsi-material-button:not(:disabled):active .gsi-material-button-state,
	.gsi-material-button:not(:disabled):focus .gsi-material-button-state {
		opacity: 12%;
		background-color: #303030;
	}

	.gsi-material-button:not(:disabled):hover {
		-webkit-box-shadow:
			0 calc(1rem / 16) calc(2rem / 16) 0 rgba(60, 64, 67, 0.3),
			0 calc(1rem / 16) calc(3rem / 16) calc(1rem / 16) rgba(60, 64, 67, 0.15);
		box-shadow:
			0 calc(1rem / 16) calc(2rem / 16) 0 rgba(60, 64, 67, 0.3),
			0 calc(1rem / 16) calc(3rem / 16) calc(1rem / 16) rgba(60, 64, 67, 0.15);
	}

	.gsi-material-button:not(:disabled):hover .gsi-material-button-state {
		opacity: 8%;
		background-color: #303030;
	}
</style>
