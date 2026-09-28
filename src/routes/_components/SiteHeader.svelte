<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import CircleUserRound from '@lucide/svelte/icons/circle-user-round';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Menu from '@lucide/svelte/icons/menu';
	import Search from '@lucide/svelte/icons/search';
	import X_img from '@lucide/svelte/icons/x';
	import { cubicOut } from 'svelte/easing';
	import { MediaQuery } from 'svelte/reactivity';
	import { fade, fly } from 'svelte/transition';

	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import favicon from '$assets/top_logo_white.png';
	import { getLaundryUrl } from '$lib/shared/laundry.js';
	import { getMainNavigation, type NavigationLink } from '$lib/shared/navigation.js';
	import { hasCapability } from '$lib/shared/permission.js';

	const user = $derived(page.data.user);
	const canManageOfferings = $derived(hasCapability(user, 'course.manage'));
	const canAccessAdmin = $derived(
		hasCapability(user, 'user.manage') ||
			hasCapability(user, 'push.send') ||
			hasCapability(user, 'banner.manage') ||
			hasCapability(user, 'system.cleanup')
	);

	const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)', false);

	let isDrawerOpen = $state(false);

	const navItems = $derived(
		getMainNavigation({ canManageOfferings, canAccessAdmin, laundryUrl: getLaundryUrl(user) })
	);

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}

	function isGroupActive(links: NavigationLink[]) {
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

	function closeOnOutsideClick(group: HTMLDetailsElement) {
		function handleClick(event: MouseEvent) {
			if (group.open && !event.composedPath().includes(group)) {
				group.open = false;
			}
		}

		document.addEventListener('click', handleClick, true);
		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}

	function toggleDrawer() {
		isDrawerOpen = !isDrawerOpen;
	}

	function closeDrawer() {
		isDrawerOpen = false;
	}
</script>

{#snippet Logo()}
	<a href={resolve('/')} class="container logo">
		<img src={favicon} alt="켄텍 로고 이미지" />
	</a>
{/snippet}

<!-- navItems contains resolved internal paths and external service links. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
{#snippet NavItems(isMobile: boolean)}
	{#each navItems as item (item.label)}
		{#if 'children' in item}
			<details
				class="nav-group"
				use:closeOnOutsideClick
				open={isMobile && isGroupActive(item.children)}
				ontoggle={closeOtherGroups}
			>
				<summary class:active={isGroupActive(item.children)}>
					<span>{item.label}</span>
					<ChevronDown class="chevron" size="0.8rem" strokeWidth={2.2} />
				</summary>
				<div class="sub-menu">
					{#each item.children as link (link.href)}
						{@const external = /^https?:\/\//.test(link.href)}
						<a
							href={link.href}
							target={external ? '_blank' : undefined}
							rel={external ? 'noopener noreferrer' : undefined}
							aria-label={external ? `${link.label} (외부 사이트)` : undefined}
							class:active={isActive(link.href)}
							aria-current={isActive(link.href) ? 'page' : undefined}
							onclick={() => {
								if (link.notice) alert(link.notice);
								if (isMobile) closeDrawer();
							}}
						>
							{link.label}{#if external || link.external}<ExternalLink
									size="0.7rem"
									aria-hidden="true"
								/>{/if}
						</a>
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
	<div class="container profile-btn">
		{#if user.group !== 'guest'}
			<a href={resolve('/profile')} class="container">
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
	<a href={resolve('/search')} class="container search-btn" aria-label="검색">
		<Search size="0.8rem" color="white" />
	</a>
{/snippet}

{#snippet DrawerBtn()}
	<button
		class="drawer-btn only-mobile container"
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
		transition:fade={{ duration: reducedMotion.current ? 0 : 200 }}
		role="button"
		tabindex="0"
		aria-label="메뉴 닫기"
		onclick={closeDrawer}
		onkeydown={(event) => event.key === 'Escape' && closeDrawer()}
	></div>
	<nav
		id="mobile-navigation"
		transition:fly={{ x: 300, duration: reducedMotion.current ? 0 : 200, easing: cubicOut }}
		class="menu only-mobile"
		aria-label="모바일 주 메뉴"
		data-sveltekit-preload-data="hover"
	>
		{@render NavItems(true)}
		<hr />
		{#if user.group !== 'guest'}
			<a class="nav-link" href={resolve('/profile')} onclick={closeDrawer}>내 정보</a>
		{:else}
			<a class="nav-link" href={resolve('/signin')} onclick={closeDrawer}>로그인</a>
		{/if}
	</nav>
{/snippet}

<header class="container" class:isMain={page.route.id === '/'} data-sveltekit-preload-data="hover">
	<div class="nav-left container">
		{@render Logo()}
		<nav class="desktop-nav only-pc" aria-label="주 메뉴">{@render NavItems(false)}</nav>
	</div>
	<div class="nav-right container">
		{@render SearchBtn()}
		{@render ProfileBtn()}
		{@render DrawerBtn()}
	</div>
</header>
{#if isDrawerOpen}{@render Drawer()}{/if}

<style lang="scss">
	@use './site-header.scss';
</style>
