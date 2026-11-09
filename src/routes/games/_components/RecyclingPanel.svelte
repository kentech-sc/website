<script lang="ts">
	import Apple from '@lucide/svelte/icons/apple';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import BottleWine from '@lucide/svelte/icons/bottle-wine';
	import CupSoda from '@lucide/svelte/icons/cup-soda';
	import Cylinder from '@lucide/svelte/icons/cylinder';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import FileText from '@lucide/svelte/icons/file-text';
	import Recycle from '@lucide/svelte/icons/recycle';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { onDestroy, tick } from 'svelte';

	import { postGame } from './game-api.js';
	import GameFeedback from './GameFeedback.svelte';

	import type { RecyclingBin, RecyclingChoice } from '$lib/shared/recycling.js';
	import type { GameSession } from '$lib/types/game.type.js';

	import { resolve } from '$app/paths';
	import { GAME_INFO } from '$lib/shared/games.js';
	import {
		gradeRecyclingChoice,
		pickRecyclingItem,
		RECYCLING_BINS,
		RECYCLING_DURATION_MS,
		RECYCLING_ITEMS,
		RECYCLING_MAX_ROUNDS
	} from '$lib/shared/recycling.js';

	let {
		canRank,
		personalScore,
		onSaved
	}: {
		canRank: boolean;
		personalScore: number | null;
		onSaved: () => Promise<void>;
	} = $props();

	const icons = {
		can: Cylinder,
		paper: FileText,
		trash: Trash2,
		glass: BottleWine,
		plastic: CupSoda,
		garbage: Apple,
		other: Ellipsis
	};

	let phase = $state<'idle' | 'loading' | 'playing' | 'done' | 'stopped'>('idle');
	let wantsPractice = $state(false);
	const practice = $derived(!canRank || wantsPractice);
	let runId: string | null = null;
	let token = '';
	let item = -1;
	let rounds = 0;
	let frame = 0;
	let startedAt = 0;
	let destroyed = false;
	let pending = $state(false);
	const previewName = RECYCLING_ITEMS[0][0];
	let name = $state(previewName);
	let score = $state(0);
	let remaining = $state(RECYCLING_DURATION_MS);
	const timerRemaining = $derived(phase === 'playing' ? remaining : RECYCLING_DURATION_MS);
	const progress = $derived(timerRemaining / RECYCLING_DURATION_MS);
	let feedback = $state<{
		chosen: RecyclingBin;
		correct: RecyclingChoice;
		scoreDelta: -1 | 0 | 1;
		previousName: string;
		subcategory?: string;
	}>();
	let interruption = $state('');
	let saved = $state<{ tone: 'info' | 'success' | 'error' | 'warn'; title: string }>();
	let heading = $state<HTMLHeadingElement>();
	let resultHeading = $state<HTMLHeadingElement>();
	let panel = $state<HTMLElement>();

	function cancelRun() {
		if (runId) void postGame({ action: 'cancel', runId }, true).catch(() => {});
	}

	onDestroy(() => {
		destroyed = true;
		if (frame) cancelAnimationFrame(frame);
		if (phase === 'playing') cancelRun();
	});

	function stop(message: string) {
		if (phase !== 'playing') return;
		cancelAnimationFrame(frame);
		interruption = message;
		phase = 'stopped';
		cancelRun();
		void tick().then(() => resultHeading?.focus({ preventScroll: true }));
	}

	async function save() {
		if (!runId || saved?.tone === 'info') return;
		const currentRun = runId;
		saved = { tone: 'info', title: '기록 저장 중' };
		try {
			const result = await postGame({ action: 'finish', runId: currentRun });
			if (destroyed) return;
			score = result.score;
			saved = {
				tone: 'success',
				title: result.improved ? '주간 최고 기록 갱신' : '기록 저장 완료'
			};
		} catch (error) {
			if (!destroyed)
				saved = { tone: 'error', title: error instanceof Error ? error.message : '기록 저장 실패' };
			return;
		}
		try {
			await onSaved();
		} catch {
			if (!destroyed && phase === 'done' && runId === currentRun) {
				saved = { tone: 'warn', title: '기록 저장 완료 · 순위 새로고침 필요' };
			}
		}
	}

	function finish() {
		cancelAnimationFrame(frame);
		phase = 'done';
		if (runId && score > 0) void save();
		void tick().then(() => resultHeading?.focus({ preventScroll: true }));
	}

	function updateTimer() {
		if (phase !== 'playing') return;
		remaining = Math.max(0, RECYCLING_DURATION_MS - (performance.now() - startedAt));
		if (remaining > 0) frame = requestAnimationFrame(updateTimer);
		else if (!pending) finish();
	}

	async function start() {
		if (phase === 'loading' || phase === 'playing' || saved?.tone === 'info') return;
		phase = 'loading';
		runId = null;
		item = -1;
		rounds = 0;
		pending = false;
		score = 0;
		feedback = undefined;
		saved = undefined;
		remaining = RECYCLING_DURATION_MS;

		try {
			if (practice) {
				item = pickRecyclingItem(-1);
				name = RECYCLING_ITEMS[item][0];
			} else {
				const { session }: { session: GameSession } = await postGame({
					action: 'start',
					game: 'recycling'
				});
				runId = session.id;
				if (destroyed || document.hidden) {
					cancelRun();
					if (!destroyed) phase = 'idle';
					return;
				}
				if (!session.recycling) throw new Error('문제 불러오기 실패');
				name = session.recycling.name;
				token = session.recycling.token;
			}
			startedAt = performance.now();
			phase = 'playing';
			frame = requestAnimationFrame(updateTimer);
			await tick();
			heading?.focus({ preventScroll: true });
		} catch (error) {
			if (!destroyed) {
				interruption = error instanceof Error ? error.message : '게임 시작 실패';
				phase = 'stopped';
			}
		}
	}

	function showFeedback(chosen: RecyclingBin, correct: RecyclingChoice, scoreDelta: -1 | 0 | 1) {
		const subcategory =
			correct === 'other'
				? (RECYCLING_ITEMS.find(([itemName]) => itemName === name)?.[2] ?? undefined)
				: undefined;
		feedback = { chosen, correct, scoreDelta, previousName: name, subcategory };
	}

	async function choose(chosen: RecyclingBin) {
		if (phase !== 'playing' || pending) return;
		if (performance.now() - startedAt >= RECYCLING_DURATION_MS) {
			finish();
			return;
		}
		if (!runId) {
			const { correctBin, scoreDelta } = gradeRecyclingChoice(RECYCLING_ITEMS[item], chosen);
			showFeedback(chosen, correctBin, scoreDelta);
			score += scoreDelta;
			if (++rounds === RECYCLING_MAX_ROUNDS) finish();
			else {
				item = pickRecyclingItem(item);
				name = RECYCLING_ITEMS[item][0];
			}
			return;
		}
		const currentRun = runId;
		pending = true;
		try {
			const result = await postGame({
				action: 'recycling-choice',
				runId: currentRun,
				token,
				bin: chosen
			});
			if (destroyed || phase !== 'playing' || runId !== currentRun) return;
			score = result.score;
			if (result.correctBin) showFeedback(chosen, result.correctBin, result.scoreDelta);
			if (result.outcome !== 'playing' || performance.now() - startedAt >= RECYCLING_DURATION_MS) {
				finish();
				return;
			}
			name = result.recycling.name;
			token = result.recycling.token;
		} catch (error) {
			if (!destroyed && runId === currentRun) {
				stop(error instanceof Error ? error.message : '선택 처리 실패');
			}
		} finally {
			if (runId === currentRun) pending = false;
		}
	}

	function handleKey(event: KeyboardEvent) {
		if (
			event.defaultPrevented ||
			!event.isTrusted ||
			event.repeat ||
			event.isComposing ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			event.shiftKey
		)
			return;
		const target = event.target;
		if (
			target instanceof HTMLElement &&
			(target.isContentEditable || target.closest('input, textarea, select, [role="textbox"]'))
		)
			return;
		if (phase !== 'playing') {
			if (
				phase === 'idle' &&
				event.code === 'Enter' &&
				(target === document.body || target === heading)
			) {
				event.preventDefault();
				void start();
			}
			return;
		}
		if (target instanceof Node && target !== document.body && !panel?.contains(target)) return;
		if (event.code === 'Escape') {
			event.preventDefault();
			stop('이번 기록 미등록');
		} else {
			const bin = RECYCLING_BINS.find((bin) => bin.code === event.code);
			if (!bin) return;
			event.preventDefault();
			void choose(bin.id);
		}
	}

	async function reset() {
		feedback = undefined;
		phase = 'idle';
		await tick();
		heading?.focus({ preventScroll: true });
	}
</script>

<svelte:window onkeydown={handleKey} onblur={() => stop('창 이탈 · 진행 기록 미등록')} />
<svelte:document
	onvisibilitychange={() => {
		if (document.hidden) stop('화면 이탈 · 진행 기록 미등록');
	}}
/>

<section bind:this={panel} class="game-panel module" aria-labelledby="recycling-title">
	<header class="game-heading-title">
		<span class="game-symbol"><Recycle size="1.2rem" aria-hidden="true" /></span>
		<div>
			<h2 id="recycling-title" bind:this={heading} tabindex="-1">{GAME_INFO.recycling.title}</h2>
			<p>{GAME_INFO.recycling.rule}</p>
		</div>
	</header>

	{#if phase === 'done' || phase === 'stopped'}
		<div class="recycling-result">
			{#if phase === 'done'}
				<h3 bind:this={resultHeading} tabindex="-1">결과 <strong>{score}점</strong></h3>
				{#if personalScore !== null}<p class="personal-best">내 최고 기록 {personalScore}점</p>{/if}
				{#if saved}
					{#snippet retry()}
						<button class="ui-button is-secondary is-compact" onclick={save}>기록 다시 저장</button>
					{/snippet}
					<GameFeedback
						tone={saved.tone}
						title={saved.title}
						busy={saved.tone === 'info'}
						actions={saved.tone === 'error' ? retry : undefined}
					/>
				{/if}
			{:else}
				<h3 bind:this={resultHeading} tabindex="-1">게임 중단</h3>
				<GameFeedback tone="warn" title={interruption} />
			{/if}
			<div class="result-actions">
				<button class="ui-button is-secondary" onclick={reset} disabled={saved?.tone === 'info'}
					>돌아가기</button
				>
				<button class="ui-button is-primary" onclick={start} disabled={saved?.tone === 'info'}>
					<RotateCcw size="0.9rem" aria-hidden="true" />다시 도전
				</button>
			</div>
		</div>
	{:else}
		<div class="play-timer">
			<div class="play-meta">
				<span>{phase === 'playing' ? score : 0}점</span>
				<strong>{(timerRemaining / 1000).toFixed(1)}초</strong>
			</div>
			<div
				class="game-progress"
				role="progressbar"
				aria-label="남은 시간"
				aria-valuenow={Math.round(progress * 100)}
			>
				<span style:width={`${progress * 100}%`}></span>
			</div>
		</div>
		<div class="recycling-question" aria-live="polite">
			<strong>{phase === 'playing' ? name : previewName}</strong>
			{#if phase === 'playing'}
				{@const correctLabel =
					feedback?.subcategory ??
					RECYCLING_BINS.find((bin) => bin.id === feedback?.correct)?.label}
				<span class="recycling-answer" data-score={feedback?.scoreDelta}>
					{#if feedback}
						{feedback.previousName} → {correctLabel}
					{/if}
				</span>
			{/if}
		</div>
		<div class="recycling-bins" role="group" aria-label="분류 선택">
			{#each RECYCLING_BINS as bin (bin.id)}
				{@const Icon = bin.id === 'vinyl' ? null : icons[bin.id]}
				<button
					class="ui-button recycling-bin"
					class:right-hand-start={bin.code === 'KeyJ'}
					class:is-correct={feedback?.correct === bin.id}
					class:is-incorrect={feedback?.chosen === bin.id && feedback.scoreDelta < 0}
					class:is-neutral={feedback?.chosen === bin.id && feedback.scoreDelta === 0}
					type="button"
					disabled={phase !== 'playing'}
					aria-disabled={pending}
					aria-keyshortcuts={bin.key}
					onclick={(event) => {
						if (event.isTrusted) void choose(bin.id);
					}}
				>
					{#if Icon}
						<Icon size="1.2rem" aria-hidden="true" />
					{:else}
						<svg
							width="1.2rem"
							height="1.2rem"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path
								d="M5 21h14a2 2 0 0 0 2-2l-1.4-8.5L19 3h-3.5L15 7a3 3 0 0 1-6 0l-.5-4H5l-.6 7.5L3 19a2 2 0 0 0 2 2Z"
							/>
							<path d="m8 13-.75 4m8.75-4 .75 4" />
						</svg>
					{/if}
					<strong>{bin.label}</strong>
					<kbd>{bin.key}</kbd>
				</button>
			{/each}
		</div>
		{#if phase !== 'playing'}
			<details class="recycling-guide">
				<summary>배출 안내</summary>
				<ul>
					<li>게임은 품목의 종류로 채점. 실제 배출은 지역 안내에 따름</li>
					<li>별도 표시가 없으면 용기를 비우고, 이물질과 테이프·송장 등 부착물을 제거한 상태</li>
					<li>기타는 폐가전, 전지, 조명, 스티로폼 등 별도로 분류하는 품목</li>
					<li>게임에서 종이팩과 무색 페트병은 기타. 각각 종이류와 플라스틱을 고르면 0점</li>
					<li>즉석밥 용기는 플라스틱. 게임에서 일반쓰레기를 고르면 0점</li>
				</ul>
				<p><strong>분류별 수거함이 없을 때 · 나주 기준</strong></p>
				<ul>
					<li><strong>종이류</strong> · 물에 젖지 않게 따로 묶어 지정 장소에 배출</li>
					<li>
						<strong>종이팩</strong> · 가까운 전용함이나 전용 봉투가 없으면 읍·면·동 행정복지센터 이용.
						전국 지침은 전용함이 없을 때 씻어 말린 팩을 따로 묶어 종이류 수거함에 배출하도록 안내
					</li>
					<li><strong>무색 페트병</strong> · 생수·음료병만 투명 봉투에 따로 담아 배출</li>
					<li>
						<strong>유리병·금속류</strong> · 분리수거장이 없으면 캔과 유리병을 투명 봉투에 함께 배출
					</li>
					<li>
						<strong>플라스틱·비닐류</strong> · 분리수거장이 없으면 일반 플라스틱과 비닐을 투명 봉투에
						함께 배출. 무색 페트병은 별도 봉투 이용
					</li>
					<li><strong>일반쓰레기</strong> · 나주시 종량제봉투에 담아 지정 장소에 배출</li>
					<li>
						<strong>불연성 폐기물</strong> · 깨진 유리병과 소량 고철은 불연성 마대에 담아 대형폐기물로
						신고. 깨진 유리병은 먼저 신문지로 감쌈
					</li>
					<li>
						<strong>음식물</strong> · 공동주택은 지정 수거용기 이용. 수거용기가 안 보이면 관리실에 배출장소
						확인. 일반주택은 전용용기에 납부필증(칩)을 꽂아 배출
					</li>
					<li>
						<strong>기타</strong> · 건전지·형광등·폐의약품은 행정복지센터 전용함 이용. 폐가전 전용함이
						없으면 방문수거 또는 대형폐기물 신고. 스티로폼은 묶거나 투명 봉투에 담아 지정 장소에 배출.
						헌옷·폐식용유는 가까운 전용함 확인
					</li>
				</ul>
				<p>
					<a href="https://naju.mx.co.kr/www/field_info/environment/recycle">재활용품</a>
					· <a href="https://naju.mx.co.kr/www/field_info/environment/food_waste">음식물</a>
					· <a href="https://naju.mx.co.kr/www/field_info/environment/large_waste">별도 수거</a>
					· <a href="https://wasteguide.or.kr/front/bbsList.do?bbsId=BBS_0003">전국 지침</a>
				</p>
			</details>
		{/if}
		<div class="recycling-controls">
			{#if phase === 'playing'}
				<button class="ui-button is-compact cancel-game" onclick={() => stop('이번 기록 미등록')}
					>중단</button
				>
			{:else}
				{#if canRank}
					<label class="practice-option"
						><input
							type="checkbox"
							bind:checked={wantsPractice}
							disabled={phase === 'loading'}
						/>연습 모드 (기록 미등록)</label
					>
				{:else}
					<p class="signin-note">기록 등록은 <a href={resolve('/signin')}>로그인</a> 후 가능</p>
				{/if}
				<button
					class="ui-button is-primary game-start"
					onclick={start}
					disabled={phase === 'loading'}
				>
					{phase === 'loading' ? '준비 중…' : '시작'}<ArrowRight size="0.9rem" aria-hidden="true" />
				</button>
			{/if}
		</div>
	{/if}
	{#if phase === 'idle' || phase === 'loading'}
		<p class="game-instruction">{GAME_INFO.recycling.instruction}</p>
	{/if}
</section>

<style lang="scss">
	@use './game-panel-common.scss';
	.game-panel {
		--recycling-neutral-accent: #666;
		container-type: inline-size;
	}
	.recycling-question {
		display: grid;
		place-content: center;
		gap: 0.35rem;
		border-radius: 0.65rem;
		background: var(--gray-bg);
		padding: 0.8rem;
		min-height: 4rem;
		text-align: center;
	}
	.recycling-question strong {
		font-size: 1.15rem;
		line-height: 1.25;
	}
	.recycling-answer,
	.recycling-guide,
	.recycling-result p {
		color: var(--gray-text);
		font-size: 0.75rem;
	}
	.recycling-answer {
		min-height: 1.25em;
	}
	.recycling-answer[data-score='-1'] {
		color: var(--error-text);
	}
	.recycling-answer[data-score='0'] {
		color: var(--recycling-neutral-accent);
	}
	.recycling-answer[data-score='1'] {
		color: var(--success-text);
	}
	.recycling-guide summary {
		cursor: pointer;
		width: fit-content;
	}
	.recycling-guide ul {
		margin: 0.45rem 0 0;
		padding-inline-start: 1.25rem;
	}
	.recycling-guide p {
		margin: 0.65rem 0 0;
	}
	.recycling-bins {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr)) 0.25fr repeat(4, minmax(0, 1fr));
		gap: 0.35rem;
	}
	.recycling-bin {
		flex-direction: column;
		gap: 0.25rem;
		border-radius: 0.65rem;
		padding: 0.5rem 0.2rem;
		min-width: 0;
		min-height: 3rem;
		font-size: 0.75rem;
		line-height: 1.15;
		text-align: center;
	}
	.recycling-bin.is-correct {
		--ui-button-border: var(--success-text);
		--ui-button-bg: var(--success-bg);
		--ui-button-hover-bg: var(--success-bg);
	}
	.recycling-bin.is-incorrect {
		--ui-button-border: var(--error-text);
		--ui-button-bg: var(--error-bg);
		--ui-button-hover-bg: var(--error-bg);
	}
	.recycling-bin.is-neutral {
		--ui-button-border: var(--recycling-neutral-accent);
		--ui-button-bg: #ececec;
		--ui-button-hover-bg: var(--ui-button-bg);
	}
	.recycling-bin:disabled {
		opacity: 0.75;
	}
	.right-hand-start {
		grid-column-start: 6;
	}
	@container (width < 32rem) {
		.recycling-bins {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
		.right-hand-start {
			grid-column-start: auto;
		}
	}
	.recycling-bin > :global(svg) {
		color: var(--secondary);
	}
	.recycling-bin kbd {
		color: var(--gray-text);
		font-size: 0.65rem;
	}
	.recycling-controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.6rem;
	}
	.recycling-controls .cancel-game {
		margin-inline: auto;
	}
	.recycling-result {
		display: grid;
		align-content: center;
		justify-items: center;
		gap: 0.8rem;
		min-height: 14rem;
		text-align: center;
	}
	.recycling-result h3 strong {
		color: var(--secondary);
	}
	@media (hover: none) {
		.recycling-bin kbd {
			display: none;
		}
	}
</style>
