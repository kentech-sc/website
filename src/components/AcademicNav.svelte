<script lang="ts">
	import BookOpenCheck from '@lucide/svelte/icons/book-open-check';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Database from '@lucide/svelte/icons/database';

	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { canManageCatalog = false }: { canManageCatalog?: boolean } = $props();
	const links = [
		{ href: '/academic', label: '이수·졸업', icon: BookOpenCheck },
		{ href: '/timetable', label: '시간표', icon: CalendarDays }
	] as const;
</script>

<nav class="academic-nav" aria-label="학업 메뉴">
	<div class="primary-links">
		{#each links as link (link.href)}
			<a
				href={resolve(link.href)}
				class:active={page.url.pathname === link.href}
				aria-current={page.url.pathname === link.href ? 'page' : undefined}
			>
				<link.icon size="1rem" strokeWidth={2.2} />
				<span>{link.label}</span>
			</a>
		{/each}
	</div>
	{#if canManageCatalog}
		<span class="divider" aria-hidden="true"></span>
		<a
			class="catalog-link"
			href={resolve('/course/import')}
			class:active={page.url.pathname === '/course/import'}
			aria-current={page.url.pathname === '/course/import' ? 'page' : undefined}
		>
			<Database size="0.95rem" />
			<span>강의 데이터</span>
		</a>
	{/if}
</nav>

<style lang="scss">
	.academic-nav,
	.primary-links,
	a {
		display: flex;
		align-items: center;
	}
	.academic-nav {
		align-self: flex-start;
		gap: 0.2rem;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.55rem;
		background: var(--gray-bg);
		padding: 0.2rem;
		max-width: 100%;
		overflow-x: auto;
	}
	.primary-links {
		gap: 0.15rem;
	}
	a {
		gap: 0.32rem;
		border-radius: 0.38rem;
		padding: 0.38rem 0.62rem;
		color: var(--gray-text);
		font-weight: 600;
		font-size: 0.74rem;
		text-decoration: none;
		white-space: nowrap;
	}
	a:hover,
	a.active {
		color: var(--secondary);
		text-decoration: none;
	}
	a:hover {
		background: var(--gray-hover);
	}
	a.active {
		box-shadow: 0 0.06rem 0.18rem var(--shadow-color);
		background: var(--white);
	}
	.divider {
		align-self: stretch;
		margin: 0.18rem 0.05rem;
		background: var(--gray-border);
		width: var(--divider-border-width);
	}
	.catalog-link {
		font-size: 0.68rem;
	}
</style>
