<script lang="ts">
	import favicon from '$lib/assets/top-logo-white.png';
	import { page } from '$app/state';
	const user = $derived(JSON.parse(page.data.user ?? '{}'));

	let { isMain = false } = $props();

	import Search_img from '@lucide/svelte/icons/search';
</script>

{#snippet Logo()}
	<a href="/" class="container">
		<img src={favicon} alt="top-logo-white" />
	</a>
{/snippet}

{#snippet Nav()}
	<nav>
		<a href="/board/notice">공지사항</a>

		<a href="/board/free">자유게시판</a>

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
	<button id="search-btn" class="container">
		<Search_img size="1.2rem" color="white" />
	</button>
	<!-- <div id="search-box">
		<input class="serach-txt" placeholder="검색어를 입력해 주세요">
	</div> -->
{/snippet}

<header class="container" id={isMain ? 'main-nav' : 'sub-nav'}>
	<div class="container">
		{@render Logo()}
		{@render Nav()}
	</div>

	<div class="container">
		{@render Search()}
		{@render Profile()}
	</div>
</header>

<style lang="scss">
	#main-nav {
		position: fixed;
	}

	header {
		z-index: 100;
		margin: 0;
		padding: 0.8rem 8rem;
		justify-content: space-between;
		position: sticky;
		top: 0;
		width: stretch;

		background-color: var(--tertiary);

		border: none;
		border-bottom: solid white 0.2rem;

		div:first-child {
			& > a:first-child {
				margin-right: 2rem;

				img {
					width: 8rem;
					position: relative;
					top: 0.1rem;
				}
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

		div:last-child {
			#profile {
				a {
					margin-left: 0.5rem;
					background: none;
					border: none;
					color: var(--tertiary-text);
				}

				a:hover {
					color: var(--white-hover);
					text-decoration: none;
				}
			}

			#search-btn {
				background-color: var(--secondary);
				border-radius: 1rem;
				border: white solid 0.1rem;
			}

			// 	#search-box {
			// 		display: flex;
			// 		align-items: center;
			// 		justify-content: space-between;

			// 		background-color: white;
			// 		border-radius: 1rem;

			// 		height: 2rem;
			// 		padding-left: 1.2rem;

			// 		input {
			// 			float: left;
			// 			padding: 0;
			// 			background: none;
			// 			border: none;
			// 			color: var(--primary-text);
			// 		}

			// 		input::placeholder {
			// 			color: var(--gray-text);
			// 		}
			// 	}
		}
	}
</style>
