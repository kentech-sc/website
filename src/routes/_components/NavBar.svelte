<script lang="ts">
	import favicon from '$assets/top-logo-white.png';

	import { page } from '$app/state';

	const user = $derived(JSON.parse(page.data.user ?? '{}'));

	let { isMain = false } = $props();

	import Search_img from '@lucide/svelte/icons/search';
	import Menu_img from '@lucide/svelte/icons/menu';
	import X_img from '@lucide/svelte/icons/x';
	import CircleUserRound_img from '@lucide/svelte/icons/circle-user-round';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let menuOpen = $state(false);
	function closeMenu() { menuOpen = false; }
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
			<a href="/profile" id="profile-anchor" class="container">
				<span class="profile-icon"><CircleUserRound_img size="2rem" strokeWidth={1.5} color="white" /></span>
				<span class="profile-name">{user.nickname}</span>
			</a>
			
		{:else}
			<a href="/signin" class="btn-anchor">
				<p>로그인</p>
			</a>
		{/if}
	</div>
{/snippet}

{#snippet Search()}
	<a href="/search" id="search-anchor" class="container">
		<Search_img size="1.2rem" color="white" />
	</a>
	<!-- <div id="search-box">
		<input class="serach-txt" placeholder="검색어를 입력해 주세요">
	</div> -->
{/snippet}

<header class="container" id={isMain ? 'main-nav' : 'sub-nav'} data-sveltekit-preload-data="hover">
	<div class="nav-left container">
		{@render Logo()}
		{@render Nav()}
	</div>

	<div class="nav-right container">
		{@render Search()}
		{@render Profile()}
		<button class="hamburger" onclick={() => (menuOpen = !menuOpen)} aria-label="메뉴">
			{#if menuOpen}
				<X_img size="1.5rem" color="white" />
			{:else}
				<Menu_img size="1.5rem" color="white" />
			{/if}
		</button>
	</div>
</header>

{#if menuOpen}
	<div class="backdrop" role="button" tabindex="0" onclick={closeMenu} onkeydown={(e) => e.key === 'Escape' && closeMenu()} transition:fade={{ duration: 200 }}></div>
	<nav class="mobile-menu" data-sveltekit-preload-data="hover" transition:fly={{ x: 320, duration: 280, easing: cubicOut }}>
		<a href="/board/notice" onclick={closeMenu}>공지사항</a>
		<a href="/board/free" onclick={closeMenu}>자유게시판</a>
		<a href="/review" onclick={closeMenu}>강의평가</a>
		<a href="/petition" onclick={closeMenu}>청원</a>
		<hr />
		{#if user.group !== 'guest'}
			<a href="/profile" onclick={closeMenu}>{user.nickname}</a>
		{:else}
			<a href="/signin" onclick={closeMenu}>로그인</a>
		{/if}
	</nav>
{/if}

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

		.nav-left {
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

		.nav-right {
			gap: 0.5rem;

			#profile {
				#profile-anchor {
					gap: 0.4rem;
					color: var(--tertiary-text);

					.profile-icon {
						display: none;
					}

					.profile-name {
						font-weight: bold;
						font-size: 1rem;
						color: var(--tertiary-text);
					}

					&:hover {
						color: var(--white-hover);
						text-decoration: none;
					}
				}

				a.btn-anchor {
					margin-left: 0.5rem;
					background: none;
					border: none;
					color: var(--tertiary-text);

					&:hover {
						color: var(--white-hover);
						text-decoration: none;
					}
				}
			}

			#search-anchor {
				padding: 0.2rem 0.5rem;
				background-color: var(--secondary);
				border-radius: 1rem;
				border: white solid 0.1rem;
			}
		}
	}

	.hamburger {
		display: none;
		background: none;
		border: none;
		padding: 0.3rem;
		cursor: pointer;

		&:hover {
			background: none;
		}
	}

	@media (max-width: 768px) {
		header {
			padding: 0.8rem 1.2rem;

			.nav-left nav {
				display: none;
			}

			.nav-right {
				gap: 0.8rem;

				#profile {
					padding-left: 0.6rem;

					#profile-anchor {
						.profile-icon { display: flex; }
						.profile-name { display: none; }
					}
				}

			}
		}

		.hamburger {
			display: flex;
			padding: 0.6rem;
		}
	}

	.backdrop {
		display: none;
	}

	.mobile-menu {
		display: none;
	}

	@media (max-width: 768px) {
		.backdrop {
			display: block;
			position: fixed;
			inset: 0;
			z-index: 98;
			background-color: oklch(0 0 0 / 50%);
			cursor: default;
		}

		.mobile-menu {
			display: flex;
			flex-direction: column;
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			width: 75vw;
			max-width: 320px;
			z-index: 99;
			background-color: white;
			overflow-y: auto;
			padding-top: 4.5rem;
			box-shadow: -4px 0 16px oklch(0 0 0 / 15%);

			a {
				color: black;
				font-weight: bold;
				font-size: 1.15rem;
				padding: 1.2rem 1.8rem;
				border-bottom: solid var(--gray-border) 1px;

				&:hover {
					background-color: var(--gray-bg);
					text-decoration: none;
				}
			}

			hr {
				border: none;
				border-top: solid var(--gray-border) 4px;
				margin: 0;
			}
		}
	}
</style>
