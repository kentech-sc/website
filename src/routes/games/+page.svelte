<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Palette from '@lucide/svelte/icons/palette';
	import Recycle from '@lucide/svelte/icons/recycle';
	import Trophy from '@lucide/svelte/icons/trophy';
	import Zap from '@lucide/svelte/icons/zap';

	import GamePanel from './_components/GamePanel.svelte';
	import RecyclingPanel from './_components/RecyclingPanel.svelte';

	import type { GameId, GamePeriod, GameStanding } from '$lib/types/game.type.js';
	import type { PageData } from './$types';

	import { invalidateAll } from '$app/navigation';
	import PageHeader from '$components/PageHeader.svelte';
	import {
		GAME_INFO,
		formatGameScore,
		getGameWeek,
		getNextGameWeekStart
	} from '$lib/shared/games.js';

	let { data }: { data: PageData } = $props();
	let selected = $state<GameId>('reaction');
	const games = Object.keys(GAME_INFO) as GameId[];
	let period = $state<GamePeriod>('week');
	const ranking = $derived(data.leaderboards[selected][period]);
	const personal = $derived(data.leaderboards[selected].all.personal?.score ?? null);
	const personalOutsideList = $derived(
		ranking.entries.some((entry) => entry.userId === data.user.id) ? null : ranking.personal
	);
	const refreshWeek = () => {
		if (getGameWeek() !== data.week) void invalidateAll();
	};

	$effect(() => {
		const nextWeek = getNextGameWeekStart(new Date(`${data.week}T00:00:00+09:00`));
		const delay = Math.max(100, Date.parse(nextWeek) - Date.now() + 100);
		const timer = setTimeout(() => void invalidateAll(), delay);
		return () => clearTimeout(timer);
	});
</script>

<svelte:window onfocus={refreshWeek} />
<svelte:document
	onvisibilitychange={() => {
		if (!document.hidden) refreshWeek();
	}}
/>

<svelte:head
	><meta
		name="description"
		content="켄텍 총학생회 미니게임. 순발력·절대색감·분리배출 게임과 종목별 주간·역대 순위."
	/></svelte:head
>

<section class="games-page page">
	<PageHeader title="미니게임" description="미니게임에 도전하고 순위를 확인하세요" />

	<div class="game-cards" role="group" aria-label="게임 선택">
		{#each games as game (game)}
			<button
				class="game-card"
				class:is-selected={selected === game}
				aria-pressed={selected === game}
				onclick={() => (selected = game)}
			>
				<span class="card-icon"
					>{#if game === 'reaction'}<Zap size="1.6rem" />{:else if game === 'color'}<Palette
							size="1.6rem"
						/>{:else}<Recycle size="1.6rem" />{/if}</span
				>
				<span class="card-copy"
					><strong>{GAME_INFO[game].title}</strong><span>{GAME_INFO[game].description}</span><small
						>{GAME_INFO[game].rule}</small
					></span
				>
				<ArrowUpRight size="1rem" aria-hidden="true" />
			</button>
		{/each}
	</div>

	<div class="games-layout">
		{#if selected === 'recycling'}
			<RecyclingPanel canRank={data.canRank} personalScore={personal} onSaved={invalidateAll} />
		{:else}
			{#key selected}<GamePanel
					game={selected}
					initialReactionCourses={data.reactionCourses}
					canRank={data.canRank}
					personalScore={personal}
					onSaved={invalidateAll}
				/>{/key}
		{/if}
		<aside class="leaderboard module" aria-labelledby="games-ranking-title">
			<header>
				<h2 id="games-ranking-title">
					<Trophy size="1rem" aria-hidden="true" />{GAME_INFO[selected].title} 순위
				</h2>
				<div class="period-tabs" role="group" aria-label="순위 기간">
					<button
						class:is-selected={period === 'week'}
						aria-pressed={period === 'week'}
						onclick={() => (period = 'week')}>이번 주</button
					>
					<button
						class:is-selected={period === 'all'}
						aria-pressed={period === 'all'}
						onclick={() => (period = 'all')}>역대</button
					>
				</div>
			</header>
			{#if ranking.entries.length}
				{#snippet standingRow(entry: GameStanding, outsideList = false)}
					{@const isMe = entry.userId === data.user.id}
					<li class:is-me={isMe} class:is-outside-list={outsideList}>
						<span class="rank-number">{entry.rank}위</span>
						<span class="rank-name">
							{#if entry.house}
								<span class="status-badge rank-house" data-house={entry.house}>
									{entry.house === 'tesla' ? '테슬라' : '에디슨'}
								</span>
							{/if}
							{entry.nickname}{#if isMe}<small>나</small>{/if}
						</span>
						<strong>{formatGameScore(selected, entry.score)}</strong>
					</li>
				{/snippet}
				<ol class="ranking-list">
					{#each ranking.entries as entry (entry.userId)}
						{@render standingRow(entry)}
					{/each}
					{#if personalOutsideList}
						{@render standingRow(personalOutsideList, true)}
					{/if}
				</ol>
			{:else}
				<p class="empty-ranking">등록된 기록 없음</p>
			{/if}
			{#if period === 'week'}
				<p class="ranking-note">매주 월요일 00:00 초기화</p>
			{/if}
		</aside>
	</div>
</section>

<style lang="scss">
	@use './games-page.scss';
</style>
