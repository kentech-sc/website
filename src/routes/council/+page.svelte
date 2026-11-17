<script lang="ts">
	import { resolve } from '$app/paths';
	import PageHeader from '$components/PageHeader.svelte';

	const departments = ['대외협력국', '복지국', '사무국', '정보국', '행사기획국', '홍보디자인국'];
	const positionsByOrgan: Record<string, string[]> = {
		총학생회장단: ['총학생회장', '제1부총학생회장', '제2부총학생회장'],
		비상대책위원회: ['비상대책위원장', '비상대책위원'],
		'학년대표 협의체': ['1학년 학년대표', '2학년 학년대표', '3학년 학년대표', '4학년 학년대표']
	};
	const committeeRolesByOrgan: Record<string, { members: string; count: string; roles: string[] }> =
		{
			감사원: {
				members: '감사위원',
				count: '감사원장 포함 5명',
				roles: ['감사원장', '총무', '서기']
			},
			중앙선거관리위원회: {
				members: '중앙선거관리위원',
				count: '위원장 포함 5명 또는 7명',
				roles: ['중앙선거관리위원장', '총무', '서기']
			}
		};
	const electedPositions = new Set([
		...positionsByOrgan.총학생회장단,
		'동아리연합회장',
		'동아리연합회 부회장',
		...positionsByOrgan['학년대표 협의체']
	]);
	const committeeMemberGroups = [
		{ label: '총학생회장단', elected: true },
		{ label: '1~4학년 학년대표', elected: true },
		{ label: '동아리연합회장단', elected: true },
		{ label: '학생교육위원장단', elected: false }
	];

	const groups = [
		{
			name: '의결기구',
			organs: [{ name: '학생총회' }, { name: '학생총투표' }, { name: '중앙운영위원회' }]
		},
		{
			name: '집행기구',
			organs: [
				{ name: '총학생회장단' },
				{ name: '중앙집행위원회' },
				{ name: '비상대책위원회', note: '회장단 궐위 등 발생 시 중앙집행위원회 대체' }
			]
		},
		{
			name: '자치기구',
			organs: [{ name: '동아리연합회' }]
		},
		{
			name: '독립기구',
			organs: [{ name: '감사원' }, { name: '중앙선거관리위원회', note: '선거·투표 시 구성' }]
		},
		{
			name: '전문기구',
			organs: [{ name: '학년대표 협의체' }, { name: '학생교육위원회' }]
		},
		{
			name: '특별기구',
			organs: []
		}
	];
</script>

<svelte:head>
	<meta name="description" content="켄텍 총학생회의 기구와 역할을 소개합니다." />
</svelte:head>

<section class="page council-page">
	<PageHeader title="조직도" description="총학생회의 구성과 기구를 한눈에 확인하세요." />

	<section class="module organization" aria-label="총학생회 구조">
		<header class="organization-header">
			<p class="position-legend">회원 직접 선출</p>
			<a href={resolve('/bylaws')}>회칙·세칙 보기 <span aria-hidden="true">↗</span></a>
		</header>

		<ul class="organization-tree">
			<li>
				<div class="organ members">
					<div class="organ-heading"><strong>총학생회</strong></div>
					<section class="committee-roles" aria-label="총학생회 회원">
						<div class="organ-heading"><strong>총학생회 회원</strong></div>
						<ul class="positions member-types" aria-label="총학생회 회원 구분">
							<li><b>정회원</b><span>회비 납부를 완료한 재학생</span></li>
							<li><b>준회원</b><span>휴학생 · 회비 납부를 완료하지 않은 재학생</span></li>
						</ul>
					</section>
				</div>
				<ul class="branches">
					{#each groups as group (group.name)}
						<li class="branch">
							<section class="group" aria-labelledby={`group-${group.name}`}>
								<header class="group-header">
									<h3 id={`group-${group.name}`}>{group.name}</h3>
								</header>
								<ul
									class="organs"
									class:decision-organs={group.name === '의결기구'}
									aria-label={group.name === '의결기구'
										? '학생총회와 학생총투표, 학생총회에서 일부 권한을 위임받은 중앙운영위원회'
										: undefined}
								>
									{#each group.organs as organ (organ.name)}
										<li
											class:direct-choice={organ.name === '학생총회' || organ.name === '학생총투표'}
											class:delegated-organ={organ.name === '중앙운영위원회'}
										>
											{#if organ.name === '중앙운영위원회'}
												<p class="delegation-label">학생총회 권한 일부 위임</p>
											{/if}
											<div
												class="organ"
												class:direct-decision={organ.name === '학생총회' ||
													organ.name === '학생총투표'}
											>
												<div class="organ-heading">
													<strong>{organ.name}</strong>
													{#if organ.note}<span>{organ.note}</span>{/if}
												</div>
												{#if positionsByOrgan[organ.name]}
													<ul class="positions" aria-label={`${organ.name} 구성`}>
														{#each positionsByOrgan[organ.name] as position (position)}
															<li class:is-elected={electedPositions.has(position)}>
																{position}
																{#if electedPositions.has(position)}<span class="visually-hidden"
																		>, 직접 선출</span
																	>{/if}
															</li>
														{/each}
													</ul>
												{/if}
												{#if committeeRolesByOrgan[organ.name]}
													{@const committee = committeeRolesByOrgan[organ.name]}
													<section class="committee-roles" aria-label={`${committee.members} 구성`}>
														<div class="organ-heading">
															<strong>{committee.members}</strong><span>{committee.count}</span>
														</div>
														<ul class="positions" aria-label={`${committee.members} 중 직책`}>
															{#each committee.roles as role (role)}<li>{role}</li>{/each}
														</ul>
													</section>
												{/if}
												{#if organ.name === '학생교육위원회'}
													<div class="education-roles">
														<section class="committee-roles" aria-label="학생교육위원장단">
															<div class="organ-heading"><strong>학생교육위원장단</strong></div>
															<ul class="positions" aria-label="학생교육위원장단 직책">
																<li>학생교육위원장</li>
																<li>학생교육위원회 부위원장</li>
															</ul>
														</section>
														<ul class="positions" aria-label="학생교육위원회 위원">
															<li>학생교육위원</li>
														</ul>
													</div>
												{/if}
												{#if organ.name === '중앙집행위원회'}
													<section class="committee-roles" aria-label="중앙집행위원 구성">
														<div class="organ-heading">
															<strong>중앙집행위원</strong>
														</div>
														<ul class="positions" aria-label="중앙집행위원 직책">
															<li>중앙집행위원장 (원칙적으로 총학생회장)</li>
															<li>부총학생회장</li>
															<li>국장</li>
															<li>국원</li>
														</ul>
													</section>
												{/if}
												{#if organ.name === '중앙운영위원회'}
													<div class="committee-members">
														<ul class="positions" aria-label="중앙운영위원 구성">
															{#each committeeMemberGroups as memberGroup (memberGroup.label)}
																<li class:is-elected={memberGroup.elected}>
																	{memberGroup.label}
																	{#if memberGroup.elected}<span class="visually-hidden"
																			>, 직접 선출</span
																		>{/if}
																</li>
															{/each}
														</ul>
														<p>의장은 원칙적으로 총학생회장</p>
													</div>
												{/if}
											</div>
											{#if organ.name === '동아리연합회'}
												<ul class="organs">
													<li>
														<section class="organ" aria-label="동아리연합회장단">
															<div class="organ-heading"><strong>동아리연합회장단</strong></div>
															<ul class="positions" aria-label="동아리연합회장단 직책">
																<li class="is-elected">
																	동아리연합회장<span class="visually-hidden">, 직접 선출</span>
																</li>
																<li class="is-elected">
																	동아리연합회 부회장<span class="visually-hidden">, 직접 선출</span
																	>
																</li>
															</ul>
														</section>
													</li>
													<li>
														<section class="organ" aria-label="동아리연합회 등록 동아리">
															<div class="organ-heading"><strong>등록 동아리</strong></div>
															<section class="committee-roles" aria-label="동아리원 구성">
																<div class="organ-heading"><strong>동아리원</strong></div>
																<ul class="positions" aria-label="동아리원 중 직책">
																	<li>동아리장</li>
																	<li>동아리총무</li>
																</ul>
															</section>
														</section>
													</li>
												</ul>
											{/if}
											{#if organ.name === '중앙집행위원회'}
												<ul class="organs">
													<li>
														<section class="organ" aria-label="중앙집행위원회 국서">
															<div class="organ-heading"><strong>국서</strong></div>
															<ul class="departments" aria-label="국서 목록">
																{#each departments as department (department)}
																	<li>{department}</li>
																{/each}
															</ul>
														</section>
													</li>
												</ul>
											{/if}
										</li>
									{/each}
								</ul>
							</section>
						</li>
					{/each}
				</ul>
			</li>
		</ul>
		<div class="note">
			<p>일부 세부 구성은 생략됨.</p>
			<ul aria-label="구조도 기준 회칙과 세칙">
				<li>총학생회칙 · 2026년 3월 17일 개정</li>
				<li>학생교육위원회세칙 · 2026년 3월 10일 개정</li>
				<li>동아리연합회칙 · 2026년 8월 14일 개정</li>
				<li>감사원세칙 · 2026년 6월 3일 개정</li>
			</ul>
		</div>
	</section>
</section>

<style lang="scss">
	.council-page {
		max-width: 64rem;
	}
	.organization {
		padding: 1.5rem;
	}
	.organization-header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
	}
	.note {
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.organization-header a {
		font-size: 0.7rem;
		white-space: nowrap;
	}
	.position-legend {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.position-legend::before {
		border-radius: 0.2rem;
		background: var(--secondary-bg);
		width: 0.65rem;
		height: 0.65rem;
		content: '';
	}
	.organ.members {
		margin-top: 0.85rem;
		border-width: var(--control-border-width);
		border-left: 0.25rem solid var(--text);
		background: var(--white);
		padding: 1rem 1.1rem;
	}
	.members > .organ-heading strong {
		font-size: 1.1rem;
	}
	.member-types span {
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.positions.member-types li {
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.organization-tree,
	.branches,
	.organs {
		list-style: none;
	}
	.branches,
	.organs {
		margin-left: 0.75rem;
		border-left: var(--control-border-width) solid var(--gray-border);
		padding-left: 1.25rem;
	}
	.branch,
	.organs > li {
		position: relative;
		padding-top: 0.6rem;
	}
	.branch::before,
	.organs > li::before {
		position: absolute;
		top: 1.35rem;
		left: -1.25rem;
		border-top: var(--control-border-width) solid var(--gray-border);
		width: 1.25rem;
		content: '';
	}
	.branch:last-child::after,
	.organs > li:last-child::after {
		position: absolute;
		top: calc(1.35rem + var(--control-border-width));
		bottom: 0;
		left: calc(-1.25rem - var(--control-border-width));
		background: var(--white);
		width: var(--control-border-width);
		content: '';
	}
	.group-header {
		border-radius: 0.6rem;
		background: var(--gray-bg);
		padding: 0.55rem 0.75rem;
	}
	.group h3 {
		color: var(--secondary);
		font-size: 0.85rem;
	}
	.decision-organs {
		display: grid;
		position: relative;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0 0.5rem;
		margin: 0;
		border: 0;
		padding: 0;
	}
	.decision-organs > .direct-choice {
		padding: 0.6rem 0 0.4rem;
	}
	.decision-organs > .direct-choice .organ {
		height: 100%;
	}
	.decision-organs > .direct-choice::before {
		top: auto;
		bottom: 0;
		left: 50%;
		border: 0;
		border-left: var(--control-border-width) solid var(--gray-border);
		width: 0;
		height: 0.4rem;
	}
	.decision-organs > .direct-choice:nth-child(2)::before,
	.decision-organs > .direct-choice:nth-child(2)::after {
		content: none;
	}
	.decision-organs > .delegated-organ {
		grid-column: 1 / -1;
		padding-top: 0.35rem;
	}
	.decision-organs > .delegated-organ::before {
		top: 0;
		left: calc(25% - 0.125rem);
		border: 0;
		border-left: var(--control-border-width) solid var(--gray-border);
		width: 0;
		height: 0.35rem;
	}
	.decision-organs > .delegated-organ:last-child::after {
		content: none;
	}
	.delegation-label {
		position: relative;
		margin-bottom: 0.2rem;
		padding-left: calc(25% + 0.375rem);
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.delegation-label::before {
		position: absolute;
		top: 0;
		bottom: -0.2rem;
		left: calc(25% - 0.125rem);
		border-left: var(--control-border-width) solid var(--gray-border);
		content: '';
	}
	.group li span {
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.organ {
		border: var(--divider-border-width) solid var(--gray-border);
		border-radius: 0.6rem;
		padding: 0.55rem 0.75rem;
	}
	.organ.direct-decision {
		background: var(--white);
		text-align: center;
	}
	.organ.direct-decision .organ-heading {
		justify-content: center;
	}
	.organ-heading {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem 0.6rem;
	}
	.committee-roles {
		margin-top: 0.6rem;
		border-radius: 0.45rem;
		background: var(--gray-bg);
		padding: 0.6rem;
	}
	.education-roles {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.6rem;
	}
	.education-roles .committee-roles,
	.education-roles .positions {
		margin-top: 0;
	}
	.education-roles .committee-roles .positions {
		margin-top: 0.5rem;
	}
	.education-roles > .positions {
		border-top: 0;
		padding-top: 0;
	}
	.positions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-top: 0.5rem;
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding-top: 0.5rem;
		list-style: none;
	}
	.positions li {
		display: inline-flex;
		align-items: center;
		border-radius: 0.35rem;
		background: var(--gray-hover);
		padding: 0.2rem 0.5rem;
		color: var(--text);
		font-size: 0.7rem;
	}
	.positions li.is-elected {
		background: var(--secondary-bg);
		color: var(--secondary);
		font-weight: 600;
	}
	.visually-hidden {
		position: absolute;
		clip-path: inset(50%);
		width: 1px;
		height: 1px;
		overflow: hidden;
		white-space: nowrap;
	}
	.departments {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-top: 0.5rem;
		list-style: none;
	}
	.departments li {
		border: var(--divider-border-width) solid var(--gray-border);
		border-radius: 0.35rem;
		background: var(--white);
		padding: 0.2rem 0.5rem;
		font-size: 0.7rem;
	}
	.organ-heading strong {
		font-size: 0.8rem;
	}
	.committee-members {
		margin-top: 0.5rem;
		border-top: var(--divider-border-width) solid var(--gray-border);
		padding-top: 0.5rem;
	}
	.committee-members .positions {
		margin: 0;
		border: 0;
		padding: 0;
	}
	.committee-members p {
		margin-top: 0.5rem;
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.note {
		margin-top: 0.75rem;
	}
	.note p {
		font-size: inherit;
	}
	.note ul {
		margin-top: 0.35rem;
		list-style: none;
	}
	@media (width <= 768px) {
		.organization {
			padding: 1rem;
		}
		.branches,
		.organs {
			margin-left: 0.45rem;
			padding-left: 0.85rem;
		}
		.branch::before,
		.organs > li::before {
			left: -0.85rem;
			width: 0.85rem;
		}
		.branch:last-child::after,
		.organs > li:last-child::after {
			left: calc(-0.85rem - var(--control-border-width));
		}
	}
</style>
