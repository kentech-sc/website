<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';

	import type { DegreeProgress } from '$lib/types/degree.type.js';

	let {
		progress,
		baseline,
		actualSelected
	}: {
		progress: DegreeProgress | null;
		baseline: DegreeProgress | null;
		actualSelected: boolean;
	} = $props();

	const percent = (value: number, required: number) =>
		required <= 0 ? 100 : Math.min(100, Math.round((value / required) * 100));
	const earned = (source: DegreeProgress | null, category: string, fallback = 0) =>
		source ? ((source.earned as Record<string, number>)[category] ?? 0) : fallback;

	const esp = $derived(progress?.sequenceProgress.find((item) => item.category === 'ESP') ?? null);
	const baselineEsp = $derived(
		baseline?.sequenceProgress.find((item) => item.category === 'ESP') ?? null
	);
	const totalBaseline = $derived(baseline?.earned.total ?? progress?.earned.total ?? 0);
	const totalDelta = $derived(progress ? Math.max(0, progress.earned.total - totalBaseline) : 0);
	const totalBaselinePercent = $derived(
		progress ? percent(totalBaseline, progress.required.total) : 0
	);
	const totalPercent = $derived(
		progress ? percent(progress.earned.total, progress.required.total) : 0
	);
	const categories = $derived(
		progress
			? Object.entries(progress.required)
					.filter(([category]) => category !== 'total')
					.map(([category, required]) => {
						const rawValue = earned(progress, category);
						const value = Math.min(rawValue, required);
						const baselineValue = Math.min(earned(baseline, category, rawValue), required);
						return {
							category,
							value,
							baseline: baselineValue,
							delta: Math.max(0, value - baselineValue),
							required
						};
					})
			: []
	);
	const details = $derived(
		progress
			? [
					[
						'ef-math',
						'EF 수학',
						progress.efSub.math,
						baseline?.efSub.math,
						progress.efSubRequired.math,
						'학점'
					],
					[
						'ef-physics',
						'EF 물리',
						progress.efSub.physics,
						baseline?.efSub.physics,
						progress.efSubRequired.physics,
						'학점'
					],
					[
						'ef-chemistry',
						'EF 화학',
						progress.efSub.chemistry,
						baseline?.efSub.chemistry,
						progress.efSubRequired.chemistry,
						'학점'
					],
					[
						'ef-data-literacy',
						'EF 데이터 리터러시',
						progress.efSub.dataLiteracy,
						baseline?.efSub.dataLiteracy,
						progress.efSubRequired.dataLiteracy,
						'학점'
					],
					[
						'el-upper',
						'EL 4·5레벨',
						progress.elUpperCredits,
						baseline?.elUpperCredits,
						progress.elUpperRequiredCredits,
						'학점'
					],
					...(esp
						? [
								[
									'esp-courses',
									'ESP 필수 수업',
									esp.completedCount,
									baselineEsp?.completedCount,
									esp.totalCount,
									'수업'
								]
							]
						: [])
				].map(([key, label, value, baselineValue, required, unit]) => ({
					key: String(key),
					label: String(label),
					value: Number(value),
					baseline: Number(baselineValue ?? value),
					required: Number(required),
					unit: String(unit)
				}))
			: []
	);
</script>

{#if progress}
	<details class="module is-flush degree-preview">
		<summary>
			<span class="accent-icon degree-icon"><GraduationCap size="1.2rem" /></span>
			<span class="degree-summary-copy">
				<b>{actualSelected ? '현재 졸업요건' : '이 시간표 반영 시'}</b>
				<small
					>{totalPercent >= 100
						? '전체 졸업학점 충족'
						: `${Math.max(0, progress.required.total - progress.earned.total)}학점 남음`}</small
				>
			</span>
			<span class="degree-summary-progress" class:complete={totalPercent >= 100}>
				<span
					><b>{progress.earned.total}</b> / {progress.required.total}학점{#if totalDelta > 0}<em
							>+{totalDelta}학점</em
						>{/if}</span
				>
				<i class="progress-track degree-progress-track">
					<b class="progress-fill baseline" style={`width: ${totalBaselinePercent}%`}></b>
					{#if totalDelta > 0}<b
							class="progress-fill added"
							style={`left: ${totalBaselinePercent}%; width: ${totalPercent - totalBaselinePercent}%`}
						></b>{/if}
				</i>
			</span>
			<span class="disclosure-icon"><ChevronDown size="0.9rem" /></span>
		</summary>
		<div class="degree-body">
			<section class="degree-section">
				<h3>분류별 학점</h3>
				<div class="degree-category-grid">
					{#each categories as item (item.category)}
						{@const complete = item.value >= item.required}
						<div class:complete>
							<span
								><b>{item.category}</b>{#if complete}<Check size="0.7rem" />{/if}</span
							>
							<small
								>{item.value}/{item.required}{#if item.delta > 0}<em>+{item.delta}</em>{/if}</small
							>
							<i class="progress-track degree-progress-track">
								<b
									class="progress-fill baseline"
									style={`width: ${percent(item.baseline, item.required)}%`}
								></b>
								{#if item.delta > 0}<b
										class="progress-fill added"
										style={`left: ${percent(item.baseline, item.required)}%; width: ${percent(item.value, item.required) - percent(item.baseline, item.required)}%`}
									></b>{/if}
							</i>
						</div>
					{/each}
				</div>
			</section>
			<section class="degree-section">
				<h3>세부 요건</h3>
				<div class="degree-detail-grid">
					{#each details as item (item.key)}
						{@const complete = item.value >= item.required}
						{@const delta = Math.max(0, item.value - item.baseline)}
						<div class:complete>
							<span
								><b>{item.label}</b>{#if complete}<Check
										size="0.7rem"
										aria-label="충족"
									/>{/if}</span
							>
							<div class="degree-detail-value">
								{#if delta > 0}<em>+{delta} {item.unit}</em>{/if}
								<small>{item.value}/{item.required} {item.unit}</small>
							</div>
						</div>
					{/each}
				</div>
			</section>
		</div>
	</details>
{:else}
	<p class="degree-note">이수·졸업에서 학사정보를 설정하면 졸업요건을 함께 확인할 수 있습니다.</p>
{/if}

<style lang="scss">
	@use '../_styles/degree-preview.scss';
</style>
