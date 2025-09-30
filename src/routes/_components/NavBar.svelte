<script lang="ts">
	import favicon from '$lib/assets/top-logo-white.png';
	import { page } from '$app/state';
	const user = $derived(JSON.parse(page.data.user ?? '{}'));

	import Search_img from '@lucide/svelte/icons/search';
</script>

{#snippet Nav()}
	<nav>
		<a href="/">공지사항</a>

		<a href="/board">자유게시판</a>
		
		<a href="/review">강의평가</a>
		
		<a href="/petition">청원</a>
	</nav>
{/snippet}

{#snippet Profile()}
	<div class="container" id="profile">
		{#if user.group !== 'guest'}
			<a href="/profile" class="btn-anchor">
				<p>{user.nickname}</p>
			</a>
		{:else}
			<a href="/signin" class="btn-anchor">
				<p>로그인</p>
			</a>
		{/if}
	</div>
{/snippet}

{#snippet Search()}
	<div id="search-box">
		<input class="serach-txt" placeholder="검색어를 입력해 주세요">
		<button class="search-button">
			<Search_img size="1.2rem" color="white"/>
		</button>
	</div>
{/snippet}

<header class="container module">
	<div class="left">
		<a href="/" class="container">
			<img src={favicon} alt="top-logo-white" />
		</a>
		{@render Nav()}
	</div>

	<div class="right">
		{@render Search()}
		{@render Profile()}
	</div>
</header>

<style lang="scss">
	header {
		z-index: 100;
		margin: 0;
		padding: 1rem 8rem;
		justify-content: space-between;
		position: sticky;
		top: 0;

		background-color: var(--tertiary);

		border: none;
		border-bottom: solid var(--gray-border) 0.1rem;
		
		.left {
			display: flex;
			align-items: center;

			img {
				width: 10rem;
				margin-right: 2.5rem;
			}

			nav {
				font-size: 1.1rem;
				a {
					color: var(--tertiary-text);
					font-weight: bold;
					padding: 1rem;
				}
				a:hover {
					color: var(--white-hover);
					text-decoration: none;
				}
			}
		}
		
		.right {
			display: flex;
			align-items: center;

			#profile {
				a {
					margin-left: 0.5rem;
					background: none;
					border: none;
					color: var(--tertiary-text)
				}

				a:hover {
					color: var(--white-hover);
					text-decoration: none;
				}
			}

			#search-box {
				display: flex;
				align-items: center;
				justify-content: space-between;
				
				background-color: white;
				border-radius: 1rem;
				
				height: 2rem;
				padding-left: 1.2rem;

				input {
					float: left;
					padding: 0;
					background: none;
					border: none;
					color: var(--primary-text)
					  
				}

				input::placeholder {
					color: var(--gray-text)
				}

				.search-button {
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: var(--secondary);
					border-radius: 50%;
					border: none;
					width: 1.8rem;
					height: 1.8rem;
					margin: 0.1rem;
					padding: 0;
				}
			}
		}
	}
</style>
