<footer>
	<h1>4th KENTECH STUDENT COUNCIL | 4:EVER</h1>
	<br />
	<p>Mail: studentcouncil@kentech.ac.kr</p>
	<br />
	<p>Developed by nemovim</p>
	<br />
	<a href="/privacy">개인정보처리방침</a>
	<a href="/terms">서비스 이용약관</a>
</footer>

<style lang="scss">
	footer {
		flex-grow: 1;
		margin-top: 1rem;
		border: none;
		border-top: solid white 0.2rem;
		padding: 1.5rem 2rem;

		color: var(--tertiary-text);
		background-color: var(--tertiary);
		justify-content: flex-start;

		h1 {
			font-weight: bold;
			font-size: 1rem;
		}

		p {
			font-size: 0.8rem;
		}

		a {
			font-size: 0.8rem;
			color: var(--tertiary-text);
			text-decoration: underline;

			&:hover {
				opacity: 0.7;
			}
		}
	}
</style>
