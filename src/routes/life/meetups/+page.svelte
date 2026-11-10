<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';

	import { resolve } from '$app/paths';
	import PageHeader from '$components/PageHeader.svelte';
	import { formatMeetupDays, isPastMeetup } from '$lib/shared/meetup.js';

	let { data } = $props();

	const today = new Date();
	const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

	/** 지난 일정은 아래로 내린다. 같은 그룹 안에서는 서버 순서(최근에 만든 것부터)를 따른다. */
	const meetups = $derived(
		data.meetups
			.map((meetup) => {
				const isPast = isPastMeetup(meetup.mode, meetup.days, todayKey);
				const days = formatMeetupDays(meetup.mode, meetup.days);
				return { ...meetup, isPast, daysLabel: isPast ? `${days} (지남)` : days };
			})
			.sort((a, b) => Number(a.isPast) - Number(b.isPast))
	);
</script>

<section class="page meetup-list-page">
	<PageHeader title="일정 조율" description="팀원들의 가능한 시간을 모아 모일 시간을 정하세요.">
		<a href={resolve('/life/meetups/new')} class="ui-button is-primary create-button">
			<Plus size="0.8rem" />
			<span>일정 만들기</span>
		</a>
	</PageHeader>

	<section class="module is-flush content-list">
		{#if meetups.length}
			<ul>
				{#each meetups as meetup (meetup.id)}
					<li class:is-past={meetup.isPast}>
						<a
							class="content-list-item"
							href={resolve('/life/meetups/[meetupId=uuid]', { meetupId: meetup.id })}
						>
							<header>
								<strong>{meetup.title}</strong>
								{#if meetup.creatorId === data.user.id}
									<span class="status-badge">내 일정</span>
								{/if}
							</header>
							<footer>
								<span>{meetup.daysLabel}</span>
								<span>응답 {meetup.responseCount}명</span>
							</footer>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p>참여한 일정이 없습니다.</p>
		{/if}
	</section>
</section>

<style lang="scss">
	.create-button {
		white-space: nowrap;
	}

	.status-badge {
		background: var(--gray-bg);
		color: var(--gray-text);
	}

	li.is-past {
		opacity: 0.6;
	}
</style>
