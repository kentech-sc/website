<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import CircleUserRound from '@lucide/svelte/icons/circle-user-round';
	import Menu from '@lucide/svelte/icons/menu';
	import Search from '@lucide/svelte/icons/search';
	import X_img from '@lucide/svelte/icons/x';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';

	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import favicon from '$assets/top_logo_white.png';
	import { BOARD_DEFINITIONS } from '$lib/shared/board.js';
	import { hasCapability } from '$lib/shared/permission.js';
	import { BoardId, type BoardId as BoardIdType } from '$lib/types/board.type.js';

	type NavLink = {
		label: string;
		href: string;
		managerOnly?: boolean;
	};

	type NavItem = NavLink | { label: string; children: NavLink[] };

	const user = $derived(page.data.user);
	const canManageCatalog = $derived(hasCapability(user, 'course.manage'));

	let isDrawerOpen = $state(false);

	const communityBoardIds = [BoardId.Notice, BoardId.Free] as const;

	function boardHref(boardId: BoardIdType) {
		return resolve('/board/[boardId=board]', { boardId });
	}

	const navItems = $derived.by<NavItem[]>(() => {
		const items: NavItem[] = [
			{
				label: '게시판',
				children: communityBoardIds.map((boardId) => ({
					label: BOARD_DEFINITIONS[boardId].title,
					href: boardHref(boardId)
				}))
			},
			{
				label: '학업',
				children: [
					{ label: '학점·졸업', href: resolve('/academic/credits') },
					{ label: '시간표', href: resolve('/academic/timetable') },
					{ label: '강의평가', href: resolve('/academic/review') },
					{
						label: '강의 관리',
						href: resolve('/academic/courses'),
						managerOnly: true
					}
				].filter((link) => !link.managerOnly || canManageCatalog)
			},
			{
				label: '소통창구',
				children: [
					{ label: '청원', href: resolve('/channel/petition') },
					{ label: '문의·건의', href: resolve('/channel/feedback') },
					{ label: '감사원 익명 제보', href: resolve('/channel/audit') }
				]
			},
			{ label: BOARD_DEFINITIONS[BoardId.Bylaw].title, href: resolve('/bylaw') }
		];

		return items;
	});

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}

	function isGroupActive(links: NavLink[]) {
		return links.some((link) => isActive(link.href));
	}

	function closeOtherGroups(event: Event) {
		const current = event.currentTarget as HTMLDetailsElement;
		if (!current.open) return;

		for (const group of current
			.closest('nav')
			?.querySelectorAll<HTMLDetailsElement>('details.nav-group[open]') ?? []) {
			if (group !== current) group.open = false;
		}
	}

	function toggleDrawer() {
		isDrawerOpen = !isDrawerOpen;
	}

	function closeDrawer() {
		isDrawerOpen = false;
	}
</script>

{#snippet Logo()}
	<a href={resolve('/')} class="inline-container logo">
		<img src={favicon} alt="켄텍 로고 이미지" />
	</a>
{/snippet}

<!-- href values in this snippet are created with resolve() in navItems. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
{#snippet NavItems(isMobile: boolean)}
	{#each navItems as item (item.label)}
		{#if 'children' in item}
			<details
				class="nav-group"
				open={isMobile && isGroupActive(item.children)}
				ontoggle={closeOtherGroups}
			>
				<summary class:active={isGroupActive(item.children)}>
					<span>{item.label}</span>
					<ChevronDown class="chevron" size="0.8rem" strokeWidth={2.2} />
				</summary>
				<div class="sub-menu">
					{#each item.children as link (link.href)}
						<a
							href={link.href}
							class:active={isActive(link.href)}
							aria-current={isActive(link.href) ? 'page' : undefined}
							onclick={() => isMobile && closeDrawer()}>{link.label}</a
						>
					{/each}
				</div>
			</details>
		{:else}
			<a
				class="nav-link"
				href={item.href}
				class:active={isActive(item.href)}
				aria-current={isActive(item.href) ? 'page' : undefined}
				onclick={() => isMobile && closeDrawer()}>{item.label}</a
			>
		{/if}
	{/each}
{/snippet}
<!-- eslint-enable svelte/no-navigation-without-resolve -->

{#snippet ProfileBtn()}
	<div class="inline-container profile-btn">
		{#if user.group !== 'guest'}
			<a href={resolve('/profile')} class="inline-container">
				<CircleUserRound size="1.6rem" strokeWidth={1.5} color="white" class="only-mobile" />
				<span class="only-pc">{user.nickname}</span>
			</a>
		{:else}
			<a href={resolve('/signin')}>
				<p>로그인</p>
			</a>
		{/if}
	</div>
{/snippet}

{#snippet SearchBtn()}
	<a href={resolve('/search')} class="inline-container search-btn" aria-label="검색">
		<Search size="0.8rem" color="white" />
	</a>
{/snippet}

{#snippet DrawerBtn()}
	<button
		class="drawer-btn only-mobile inline-container"
		type="button"
		onclick={toggleDrawer}
		aria-label={isDrawerOpen ? '메뉴 닫기' : '메뉴 열기'}
		aria-expanded={isDrawerOpen}
		aria-controls="mobile-navigation"
	>
		{#if isDrawerOpen}
			<X_img size="1.3rem" color="white" />
		{:else}
			<Menu size="1.3rem" color="white" />
		{/if}
	</button>
{/snippet}

{#snippet Drawer()}
	<div
		class="backdrop only-mobile"
		role="button"
		tabindex="0"
		aria-label="메뉴 닫기"
		onclick={closeDrawer}
		onkeydown={(event) => event.key === 'Escape' && closeDrawer()}
		transition:fade={{ duration: 200 }}
	></div>
	<nav
		id="mobile-navigation"
		class="menu only-mobile"
		aria-label="모바일 주 메뉴"
		data-sveltekit-preload-data="hover"
		transition:fly={{ x: 300, duration: 200, easing: cubicOut }}
	>
		{@render NavItems(true)}
		<hr />
		{#if user.group !== 'guest'}
			<a class="nav-link" href={resolve('/profile')} onclick={closeDrawer}>{user.nickname}</a>
		{:else}
			<a class="nav-link" href={resolve('/signin')} onclick={closeDrawer}>로그인</a>
		{/if}
	</nav>
{/snippet}

<header class="container" class:isMain={page.route.id === '/'} data-sveltekit-preload-data="hover">
	<div class="nav-left container">
		{@render Logo()}
		<nav class="desktop-nav only-pc" aria-label="주 메뉴">
			{@render NavItems(false)}
		</nav>
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
	@use 'media';

	header {
		position: sticky;
		top: 0;
		justify-content: space-between;
		z-index: 100;
		margin: 0;
		border: none;
		border-bottom: solid white 0.2rem;
		background-color: var(--tertiary);
		padding: 0.4rem 1rem;
		width: 100%;

		@include media.pc {
			padding: 0.4rem 10vw;
		}
	}

	.nav-left .logo {
		margin-right: 1.2rem;

		img {
			position: relative;
			top: 0.1rem;
			width: 6rem;
		}
	}

	.desktop-nav {
		display: flex;
		align-items: center;
		font-size: 0.9rem;
	}

	.nav-link,
	.nav-group summary {
		color: var(--white);
		font-weight: 600;
		text-decoration: none;
	}

	.desktop-nav > .nav-link,
	.desktop-nav > .nav-group > summary {
		padding: 0.2rem 0.6rem;
	}

	.desktop-nav .nav-link:hover,
	.desktop-nav .nav-link.active,
	.desktop-nav summary:hover,
	.desktop-nav summary.active {
		color: var(--white-hover);
	}

	.nav-group {
		position: relative;

		summary {
			display: flex;
			align-items: center;
			gap: 0.2rem;
			cursor: pointer;
			list-style: none;
		}

		summary::-webkit-details-marker {
			display: none;
		}

		:global(.chevron) {
			transition: transform 150ms ease;
		}

		&[open] :global(.chevron) {
			transform: rotate(180deg);
		}
	}

	.desktop-nav .sub-menu {
		display: flex;
		position: absolute;
		top: 100%;
		left: 0;
		flex-direction: column;
		z-index: 101;
		box-shadow: 0 0.2rem 0.8rem var(--shadow-color);
		border: solid var(--gray-border) 0.1rem;
		border-radius: 0.4rem;
		background: var(--white);
		padding: 0.2rem;
		min-width: 7rem;

		a {
			border-radius: 0.2rem;
			padding: 0.6rem 0.8rem;
			color: black;
			font-weight: 600;
			text-decoration: none;
			white-space: nowrap;

			&:hover,
			&.active {
				background: var(--gray-bg);
				color: var(--secondary);
			}
		}
	}

	.nav-right {
		gap: 0.4rem;
	}

	.profile-btn a {
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

	.search-btn {
		border-radius: 0.4rem;
		background-color: var(--secondary);
		padding: 0.2rem 0.4rem;

		&:hover {
			background-color: var(--secondary-strong-hover);
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
		padding-top: 3.2rem;
		width: 75vw;
		max-width: 15rem;
		overflow-y: auto;

		.nav-link,
		.nav-group summary {
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: solid var(--gray-border) 0.1rem;
			padding: 0.8rem 1.4rem;
			min-height: 2.4rem;
			color: black;
			font-weight: 600;
			font-size: 0.9rem;
			text-decoration: none;
		}

		.nav-link:hover,
		.nav-link.active,
		.nav-group summary:hover,
		.nav-group summary.active {
			background-color: var(--gray-bg);
			color: var(--secondary);
		}

		.nav-group {
			position: static;
		}

		.sub-menu {
			display: flex;
			flex-direction: column;
			background: var(--gray-bg);

			a {
				border-bottom: solid var(--gray-border) 0.1rem;
				padding: 0.8rem 2rem;
				min-height: 2.4rem;
				color: black;
				font-weight: 500;
				font-size: 0.8rem;
				text-decoration: none;

				&:hover,
				&.active {
					background: var(--gray-hover);
					color: var(--secondary);
				}
			}
		}

		hr {
			margin: 0;
			border: none;
			border-top: solid var(--gray-border) 0.2rem;
		}
	}
</style>
