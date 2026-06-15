<script lang="ts">
	import CircleUserRound from '@lucide/svelte/icons/circle-user-round';
	import Menu from '@lucide/svelte/icons/menu';
	import Search from '@lucide/svelte/icons/search';
	import X_img from '@lucide/svelte/icons/x';
	import { cubicOut } from 'svelte/easing';
	import { fly, fade } from 'svelte/transition';

	import { page } from '$app/state';
	import favicon from '$assets/top_logo_white.png';

	const user = $derived(page.data.user);

	let isDrawerOpen = $state(false);

	const toggleDrawer = () => {
		isDrawerOpen = !isDrawerOpen;
	};
	function closeDrawer() {
		isDrawerOpen = false;
	}
</script>

{#snippet Logo()}
	<a href="/" class="inline-container logo">
		<img src={favicon} alt="켄텍 로고 이미지" />
	</a>
{/snippet}

{#snippet Nav()}
	<nav class="desktop-only">
		<a href="/board/notice">공지사항</a>
		<a href="/board/free">자유게시판</a>
		<a href="/board/bylaw">회칙·세칙</a>
		<a href="/review">강의평가</a>
		<a href="/petition">청원</a>
	</nav>
{/snippet}

{#snippet ProfileBtn()}
	<div class="inline-container profile-btn">
		{#if user.group !== 'guest'}
			<a href="/profile" class="inline-container">
				<CircleUserRound size="1.6rem" strokeWidth={1.5} color="white" class="mobile-only" />
				<span class="desktop-only">{user.nickname}</span>
			</a>
		{:else}
			<a href="/signin">
				<p>로그인</p>
			</a>
		{/if}
	</div>
{/snippet}

{#snippet SearchBtn()}
	<a href="/search" class="inline-container search-btn">
		<Search size="0.8rem" color="white" />
	</a>
{/snippet}

{#snippet DrawerBtn()}
	<button class="drawer-btn mobile-only inline-container" onclick={toggleDrawer}>
		{#if isDrawerOpen}
			<X_img size="1.3rem" color="white" />
		{:else}
			<Menu size="1.3rem" color="white" />
		{/if}
	</button>
{/snippet}

{#snippet Drawer()}
	<div
		class="backdrop mobile-only"
		role="button"
		tabindex="0"
		onclick={closeDrawer}
		onkeydown={(e) => e.key === 'Escape' && closeDrawer()}
		transition:fade={{ duration: 200 }}
	></div>
	<nav
		class="menu mobile-only"
		data-sveltekit-preload-data="hover"
		transition:fly={{ x: 300, duration: 200, easing: cubicOut }}
	>
		<a href="/board/notice" onclick={closeDrawer}>공지사항</a>
		<a href="/board/free" onclick={closeDrawer}>자유게시판</a>
		<a href="/board/bylaw" onclick={closeDrawer}>회칙·세칙</a>
		<a href="/review" onclick={closeDrawer}>강의평가</a>
		<a href="/petition" onclick={closeDrawer}>청원</a>
		<hr />
		{#if user.group !== 'guest'}
			<a href="/profile" onclick={closeDrawer}>{user.nickname}</a>
		{:else}
			<a href="/signin" onclick={closeDrawer}>로그인</a>
		{/if}
	</nav>
{/snippet}

<header class="container" class:isMain={page.route.id === '/'} data-sveltekit-preload-data="hover">
	<div class="nav-left container">
		{@render Logo()}
		{@render Nav()}
	</div>

	<div class="nav-right container">
		{@render SearchBtn()}
		{@render ProfileBtn()}
		{@render DrawerBtn()}
	</div>
</header>

{#if isDrawerOpen}
	{@render Drawer()}
{/if}

<style lang="scss">
	header {
		top: 0;
		justify-content: space-between;

		z-index: 100;

		margin: 0;

		border: none;
		border-bottom: solid white 0.2rem;

		background-color: var(--tertiary);
		padding: 0.6rem 6.4rem;
		width: 100%;

		&.isMain {
			position: fixed;
		}

		&:not(.isMain) {
			position: sticky;
		}

		.nav-left {
			.logo {
				margin-right: 1.2rem;

				img {
					position: relative;
					top: 0.1rem;
					width: 6rem;
				}
			}

			nav {
				font-size: 0.9rem;

				a {
					padding: 0.6rem;
					color: var(--white);
					font-weight: 600;
					text-decoration: none;

					&:hover {
						color: var(--white-hover);
					}
				}
			}
		}

		.nav-right {
			gap: 0.4rem;

			.profile-btn {
				a {
					border-radius: 0.2rem;
					padding: 0.2rem 0.4rem;

					color: var(--white);
					font-weight: 600;
					font-size: 0.8rem;

					text-decoration: none;

					&:hover {
						color: var(--white-hover);
					}
				}
			}

			.search-btn {
				border-radius: 0.4rem;
				background-color: var(--secondary);
				padding: 0.2rem 0.4rem;

				&:hover {
					background-color: var(--secondary-strong-hover);
				}
			}
		}
	}

	.drawer-btn {
		border: none;
		background: none;
		padding: 0.2rem;
	}

	.backdrop {
		display: block;
		position: fixed;
		z-index: 98;
		cursor: default;
		inset: 0;
		background-color: oklch(0 0 0 / 20%);
	}

	.menu {
		display: flex;
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		flex-direction: column;
		z-index: 99;
		box-shadow: -0.4rem 0 1.6rem oklch(0 0 0 / 15%);

		background-color: white;
		padding-top: 3.6rem;

		width: 75vw;
		max-width: 300px;
		overflow-y: auto;

		a {
			border-bottom: solid var(--gray-border) 0.1rem;
			padding: 0.8rem 1.4rem;
			color: black;
			font-weight: 600;
			font-size: 0.9rem;
			text-decoration: none;

			&:hover {
				background-color: var(--gray-bg);
			}
		}

		hr {
			margin: 0;
			border: none;
			border-top: solid var(--gray-border) 0.2rem;
		}
	}
</style>
