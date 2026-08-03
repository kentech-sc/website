<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer>
	<h1>5th KENTECH STUDENT COUNCIL | 이음</h1>
	<p>Mail: studentcouncil@kentech.ac.kr</p>
	<p>Developed by nemovim</p>
	<div>
		<a href={resolve('/privacy')}>개인정보처리방침</a>
		<a href={resolve('/terms')}>서비스이용약관</a>
	</div>
</footer>

<style lang="scss">
	footer {
		display: flex;

		flex-grow: 1;
		flex-direction: column;
		justify-content: flex-start;
		gap: 0.6rem;

		margin-top: 1rem;

		border: none;
		border-top: solid var(--white) 0.2rem;
		background-color: var(--tertiary);
		padding: 1.4rem 1.6rem;

		color: var(--tertiary-text);

		h1 {
			font-weight: 600;
			font-size: 0.8rem;
		}

		p {
			font-size: 0.6rem;
		}

		a {
			color: var(--white);
			font-size: 0.6rem;
			text-decoration: underline;

			&:hover {
				color: var(--white-hover);
			}
		}
	}
</style>
