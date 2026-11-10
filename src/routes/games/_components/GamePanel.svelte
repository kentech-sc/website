<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Palette from '@lucide/svelte/icons/palette';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Zap from '@lucide/svelte/icons/zap';
	import { onDestroy, tick } from 'svelte';

	import { postGame as post } from './game-api.js';
	import GameFeedback from './GameFeedback.svelte';
	import { pickReactionCourses } from './reaction-cart.js';
	import ReactionCart from './ReactionCart.svelte';

	import type { GameId, GameSession, RankedColorBoard } from '$lib/types/game.type.js';

	import { resolve } from '$app/paths';
	import {
		COLOR_DURATION_MS,
		COLOR_MAX_ROUNDS,
		GAME_INFO,
		REACTION_ROUNDS,
		REACTION_WINDOW_MS,
		calculateReactionScore,
		formatGameScore,
		getColorBoard,
		getReactionDelay
	} from '$lib/shared/games.js';

	let {
		game,
		initialReactionCourses,
		canRank,
		personalScore,
		onSaved
	}: {
		game: Exclude<GameId, 'recycling'>;
		initialReactionCourses: string[];
		canRank: boolean;
		personalScore: number | null;
		onSaved: () => Promise<void>;
	} = $props();

	type Phase =
		'idle' | 'loading' | 'waiting' | 'ready' | 'processing' | 'playing' | 'done' | 'stopped';
	type FinishReason = 'complete' | 'mistake' | 'timeout';
	type Interruption = {
		tone: 'info' | 'warn' | 'error';
		title: string;
		description: string;
	};
	let phase = $state<Phase>('idle');
	let interruption = $state<Interruption | null>(null);
	let wantsPractice = $state(false);
	const practice = $derived(!canRank || wantsPractice);
	let session = $state<GameSession | null>(null);
	let answers = $state<number[]>([]);
	let colorLevel = $state(0);
	let rankedBoard = $state<RankedColorBoard>();
	let colorPending = $state(false);
	let runCourses = $state<string[] | null>(null);
	const reactionCourses = $derived(runCourses ?? initialReactionCourses);
	let remaining = $state(COLOR_DURATION_MS);
	let score = $state<number | null>(null);
	let message = $state('');
	let saveState = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let saveMessage = $state('');
	let saveWarning = $state(false);
	let saveRunId: string | null = null;
	let startedAt = 0;
	let readyAt = 0;
	let signalToken: string | undefined;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let frame = 0;
	let destroyed = false;
	let busy = false;
	let gameTitle = $state<HTMLHeadingElement>();
	let retryButton = $state<HTMLButtonElement>();
	const previewBoard = getColorBoard(0, 0);
	const colorPlaying = $derived(phase === 'playing');
	const board = $derived(
		colorPlaying && practice ? getColorBoard(session?.seed ?? 0, colorLevel) : previewBoard
	);
	const colorSide = $derived(colorPlaying && rankedBoard ? rankedBoard.side : board.side);
	const active = $derived(['waiting', 'ready', 'processing', 'playing'].includes(phase));
	const timerRemaining = $derived(colorPlaying ? remaining : COLOR_DURATION_MS);
	const progress = $derived(timerRemaining / COLOR_DURATION_MS);
	$effect(() => {
		if (phase === 'stopped') {
			retryButton?.focus({ preventScroll: true });
		}
	});

	const clearTimers = () => {
		clearTimeout(timer);
		if (frame) cancelAnimationFrame(frame);
	};

	onDestroy(() => {
		destroyed = true;
		clearTimers();
		if (active) cancelRankedRun();
	});

	const stop = (title: string, description: string, tone: Interruption['tone'] = 'warn') => {
		if (!active) return;
		clearTimers();
		phase = 'stopped';
		interruption = { title, description, tone };
		cancelRankedRun();
	};

	function cancelRankedRun() {
		if (!practice && session) {
			void post({ action: 'cancel', runId: session.id }, true).catch(() => {});
		}
	}

	const save = async () => {
		if (!saveRunId || practice || saveState === 'saving') return;
		const runId = saveRunId;
		saveState = 'saving';
		saveWarning = false;
		try {
			const result = await post({ action: 'finish', runId });
			if (destroyed) return;
			saveState = 'saved';
			saveMessage = result.improved ? '주간 최고 기록 갱신' : '기록 저장 완료';
			try {
				await onSaved();
			} catch {
				if (!destroyed && phase === 'done' && saveRunId === runId) saveWarning = true;
			}
		} catch (error) {
			if (destroyed) return;
			saveState = 'error';
			saveMessage = error instanceof Error ? error.message : '기록 저장 실패';
		}
	};

	const finish = (reason: FinishReason) => {
		if (!session || !active) return;
		clearTimers();
		score = game === 'reaction' ? calculateReactionScore(answers)! : colorLevel;
		saveRunId = session.id;
		phase = 'done';
		if (game === 'color') {
			message =
				reason === 'mistake'
					? '오답 선택으로 종료'
					: reason === 'timeout'
						? '제한 시간 종료'
						: '전 단계 완료';
		}
		if (!practice && (game === 'reaction' || score > 0)) void save();
	};

	const isCurrentRun = (runId: string, expected: Phase) =>
		!destroyed && phase === expected && session?.id === runId;

	const showReactionSignal = (token?: string) => {
		signalToken = token;
		readyAt = performance.now();
		phase = 'ready';
		timer = setTimeout(
			() => stop('입력 시간 초과', '수강신청 버튼 활성화 후 2초 이내 선택'),
			REACTION_WINDOW_MS
		);
	};

	const waitForSignal = async () => {
		if (!session) return;
		phase = 'waiting';
		const { id, seed } = session;
		if (!practice) {
			try {
				const { token } = await post({ action: 'reaction-signal', runId: id });
				if (isCurrentRun(id, 'waiting')) showReactionSignal(token);
			} catch (error) {
				if (isCurrentRun(id, 'waiting')) {
					stop('신호 받기 실패', error instanceof Error ? error.message : '다시 시도', 'error');
				}
			}
			return;
		}
		timer = setTimeout(
			() => {
				frame = requestAnimationFrame(() => showReactionSignal());
			},
			getReactionDelay(seed ?? 0, answers.length)
		);
	};

	const updateColorTimer = () => {
		if (phase !== 'playing') return;
		remaining = Math.max(0, COLOR_DURATION_MS - (performance.now() - startedAt));
		if (remaining <= 0) {
			if (!colorPending) finish('timeout');
		} else frame = requestAnimationFrame(updateColorTimer);
	};

	const returnToStart = async () => {
		if (saveState === 'saving') return;
		answers = [];
		if (game === 'reaction') runCourses = pickReactionCourses();
		phase = 'idle';
		await tick();
		gameTitle?.focus();
	};

	const start = async () => {
		if (busy || saveState === 'saving') return;
		const replay = phase === 'done' || phase === 'stopped';
		busy = true;
		clearTimers();
		phase = 'loading';
		answers = [];
		colorLevel = 0;
		rankedBoard = undefined;
		colorPending = false;
		score = null;
		message = '';
		interruption = null;
		saveMessage = '';
		saveWarning = false;
		saveState = 'idle';
		saveRunId = null;
		try {
			session = practice
				? {
						id: crypto.randomUUID(),
						game,
						seed: crypto.getRandomValues(new Uint32Array(1))[0] & 0x7fffffff
					}
				: (await post({ action: 'start', game })).session;
			if (destroyed) return;
			startedAt = performance.now();
			if (game === 'reaction') {
				runCourses = replay ? pickReactionCourses() : reactionCourses;
				void waitForSignal();
			} else {
				rankedBoard = session?.board;
				remaining = COLOR_DURATION_MS;
				phase = 'playing';
				frame = requestAnimationFrame(updateColorTimer);
			}
		} catch (error) {
			if (destroyed) return;
			phase = 'stopped';
			interruption = {
				tone: 'error',
				title: '게임 시작 실패',
				description: error instanceof Error ? error.message : '연결 상태 확인 후 다시 시도'
			};
		} finally {
			busy = false;
		}
	};

	const register = async (courseIndex: number) => {
		if (phase === 'waiting' || (phase === 'ready' && answers.length !== courseIndex)) {
			stop('부정 출발', '버튼이 열리기 전에 클릭 · 이번 기록 미등록');
			return;
		}
		if (phase !== 'ready' || !session) return;
		let elapsed = Math.round(performance.now() - readyAt);
		clearTimers();
		if (elapsed > REACTION_WINDOW_MS) {
			stop('입력 시간 초과', '수강신청 버튼 활성화 후 2초 이내 선택');
			return;
		}
		if (!practice) {
			const runId = session.id;
			phase = 'processing';
			try {
				const result = await post({ action: 'reaction-click', runId, token: signalToken });
				if (!isCurrentRun(runId, 'processing')) return;
				elapsed = result.elapsed;
			} catch (error) {
				if (isCurrentRun(runId, 'processing')) {
					stop('입력 처리 실패', error instanceof Error ? error.message : '다시 시도', 'error');
				}
				return;
			}
		}
		answers = [...answers, elapsed];
		if (answers.length === REACTION_ROUNDS) finish('complete');
		else void waitForSignal();
	};

	const choose = async (index: number, event: MouseEvent) => {
		if (!event.isTrusted || phase !== 'playing' || colorPending || !session) return;
		if (performance.now() - startedAt >= COLOR_DURATION_MS) {
			finish('timeout');
			return;
		}
		if (practice) {
			if (index !== board.target) finish('mistake');
			else if (++colorLevel === COLOR_MAX_ROUNDS) finish('complete');
			return;
		}
		if (!rankedBoard) return;
		const runId = session.id;
		colorPending = true;
		try {
			const result = await post({ action: 'color-choice', runId, token: rankedBoard.token, index });
			if (!isCurrentRun(runId, 'playing')) return;
			colorLevel = result.cleared;
			if (result.outcome !== 'playing') finish(result.outcome);
			else if (performance.now() - startedAt >= COLOR_DURATION_MS) finish('timeout');
			else rankedBoard = result.board;
		} catch (error) {
			if (isCurrentRun(runId, 'playing')) {
				stop('입력 처리 실패', error instanceof Error ? error.message : '다시 시도', 'error');
			}
		} finally {
			if (session?.id === runId) colorPending = false;
		}
	};
</script>

<svelte:document
	onvisibilitychange={() => {
		if (document.hidden) stop('게임 중단', '화면 이탈 · 진행 기록 미등록', 'info');
	}}
/>
<svelte:window onblur={() => stop('게임 중단', '창 이탈 · 진행 기록 미등록', 'info')} />

{#snippet SaveRetry()}
	<button class="ui-button is-secondary is-compact" onclick={save}>기록 다시 저장</button>
{/snippet}

{#snippet EndActions()}
	<div class="result-actions">
		<button class="ui-button is-secondary" onclick={returnToStart} disabled={saveState === 'saving'}
			>돌아가기</button
		>
		<button
			bind:this={retryButton}
			class="ui-button is-primary"
			onclick={start}
			disabled={saveState === 'saving'}><RotateCcw size="0.9rem" />다시 도전</button
		>
	</div>
{/snippet}

{#snippet StartButton()}
	<button class="ui-button is-primary game-start" onclick={start} disabled={phase === 'loading'}>
		{phase === 'loading' ? '준비 중…' : '시작'}<ArrowRight size="0.9rem" aria-hidden="true" />
	</button>
{/snippet}

{#snippet ParticipationOptions()}
	{#if canRank}
		<label class="practice-option"
			><input type="checkbox" bind:checked={wantsPractice} disabled={phase === 'loading'} />연습
			모드 (기록 미등록)</label
		>
	{:else}
		<p class="signin-note">기록 등록: <a href={resolve('/signin')}>로그인</a> 필요</p>
	{/if}
{/snippet}

<section class="game-panel module" aria-label={`${GAME_INFO[game].title} 게임`}>
	<header>
		<div class="game-heading-title">
			<span class="game-symbol"
				>{#if game === 'reaction'}<Zap size="1.2rem" />{:else}<Palette size="1.2rem" />{/if}</span
			>
			<div>
				<h2 bind:this={gameTitle} tabindex="-1">{GAME_INFO[game].title}</h2>
				<p>{GAME_INFO[game].rule}</p>
			</div>
		</div>
	</header>

	{#if phase === 'stopped' && interruption}
		<div class="game-stopped">
			<GameFeedback {...interruption} />
			{@render EndActions()}
		</div>
	{:else if game === 'reaction' && phase !== 'done'}
		<ReactionCart
			{phase}
			courses={reactionCourses}
			round={answers.length}
			startButton={StartButton}
			onCancel={() => stop('게임 중단', '이번 기록 미등록', 'info')}
			onRegister={register}
			options={ParticipationOptions}
		/>
	{:else if phase === 'done'}
		<div class="game-result" aria-live="polite">
			<span class="eyebrow">결과</span>
			<strong class="result-score"
				>{game === 'reaction' ? score : `${score}`}<small>{GAME_INFO[game].unit}</small></strong
			>
			{#if game === 'reaction'}
				<h3>
					{score! < 230 ? '올클리어!' : score! < 350 ? '시간표 조정 중' : '증원 공지 기다리는 중'}
				</h3>
			{:else}
				<h3>
					{score! < 10 ? '방금 건 조명 탓' : score! < 17 ? '분명 저 칸만 달랐는데' : '완벽한 색감!'}
				</h3>
			{/if}
			{#if game === 'reaction'}
				<dl class="course-results">
					{#each reactionCourses as course, round (course)}
						<div>
							<dt>{course}</dt>
							<dd>{answers[round]} ms</dd>
						</div>
					{/each}
				</dl>
			{:else}
				<p>{message}</p>
			{/if}
			<p class="personal-best">
				내 역대 최고 <b>{personalScore === null ? '—' : formatGameScore(game, personalScore)}</b>
			</p>
			{#if practice}
				<GameFeedback tone="info" title="연습 기록" description="순위 미반영" />
			{:else if game === 'color' && score === 0}
				<GameFeedback tone="info" title="기록 미등록" description="1단계 이상 통과 필요" />
			{:else if saveState === 'error'}
				<GameFeedback
					tone="error"
					title="기록 저장 실패"
					description={saveMessage}
					actions={SaveRetry}
				/>
			{:else if saveWarning}
				<GameFeedback tone="warn" title={saveMessage} description="순위 새로고침 필요" />
			{:else if saveState === 'saving'}
				<GameFeedback tone="info" title="기록 저장 중" busy />
			{:else if saveState === 'saved'}
				<GameFeedback tone="success" title={saveMessage} />
			{/if}
			{@render EndActions()}
		</div>
	{:else}
		<div class="play-timer">
			<div class="play-meta">
				<span>{colorPlaying ? colorLevel + 1 : 1}단계</span>
				<strong>{(timerRemaining / 1000).toFixed(1)}초</strong>
			</div>
			<div
				class="game-progress"
				role="progressbar"
				aria-label="남은 시간"
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={Math.round(progress * 100)}
			>
				<span style:width={`${progress * 100}%`}></span>
			</div>
		</div>
		<div
			class="color-board"
			aria-hidden={!colorPlaying}
			style:grid-template-columns={`repeat(${colorSide}, 1fr)`}
			style:--tile-base={board.base}
			style:--tile-accent={board.accent}
		>
			{#each Array(colorSide * colorSide) as _, index (index)}
				<button
					class="color-tile"
					class:is-different={(!colorPlaying || practice) && index === board.target}
					style:--tile-base={colorPlaying ? rankedBoard?.colors[index] : undefined}
					disabled={!colorPlaying}
					aria-disabled={colorPending}
					aria-label={`${Math.floor(index / colorSide) + 1}행 ${(index % colorSide) + 1}열 타일`}
					onclick={(event) => choose(index, event)}
				></button>
			{/each}
		</div>
		{#if colorPlaying}
			<button
				class="ui-button is-compact cancel-game"
				onclick={() => stop('게임 중단', '이번 기록 미등록', 'info')}>중단</button
			>
		{:else}
			<div class="color-start-controls">
				{@render ParticipationOptions()}
				{@render StartButton()}
			</div>
		{/if}
	{/if}
	{#if phase === 'idle' || phase === 'loading'}
		<p class="game-instruction">{GAME_INFO[game].instruction}</p>
	{/if}
</section>

<style lang="scss">
	@use './game-panel.scss';
</style>
