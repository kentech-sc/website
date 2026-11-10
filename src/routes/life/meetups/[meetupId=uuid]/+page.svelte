<script lang="ts">
	import Link from '@lucide/svelte/icons/link';
	import List from '@lucide/svelte/icons/text';
	import Trash from '@lucide/svelte/icons/trash-2';

	import GroupAvailability from './_components/GroupAvailability.svelte';
	import MyAvailability from './_components/MyAvailability.svelte';

	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ChoiceTabs from '$components/ChoiceTabs.svelte';
	import InlineActionForm from '$components/InlineActionForm.svelte';
	import PageHeader from '$components/PageHeader.svelte';
	import { formatMeetupDays, formatTimeRange } from '$lib/shared/meetup.js';

	let { data } = $props();

	type Panel = 'mine' | 'group';
	const PANEL_OPTIONS: Array<{ value: Panel; label: string }> = [
		{ value: 'mine', label: '내 일정' },
		{ value: 'group', label: '전체 현황' }
	];

	const meetup = $derived(data.meetup);
	const savedSlots = $derived(
		data.responses.find((response) => response.userId === data.user.id)?.slots ?? []
	);
	const summary = $derived(
		`${formatMeetupDays(meetup.mode, meetup.days)}, ${formatTimeRange(meetup.startMinute, meetup.endMinute)}`
	);

	/** 내 선택. 자동 저장이 끝나기 전에도 전체 현황에 바로 반영한다. */
	let selected = $derived(new Set(savedSlots));
	const responses = $derived.by(() => {
		const mine = {
			userId: data.user.id,
			nickname: data.user.nickname,
			slots: [...selected],
			updatedAt: new Date().toISOString()
		};
		const hasSaved = data.responses.some((response) => response.userId === data.user.id);
		const merged = hasSaved
			? data.responses.map((response) => (response.userId === data.user.id ? mine : response))
			: [...data.responses, mine];
		return merged.filter((response) => response.slots.length);
	});

	/** 모바일에서 한 번에 보여줄 표. */
	let panel = $state<Panel>('mine');
	let copyLabel = $state('링크 복사');

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(page.url.href);
		} catch {
			prompt('아래 링크를 복사하세요.', page.url.href);
			return;
		}
		copyLabel = '복사됨';
		setTimeout(() => (copyLabel = '링크 복사'), 2000);
	};
</script>

<section class="page">
	<PageHeader title={meetup.title} description={summary}>
		<div class="actions">
			<button type="button" class="ui-button is-primary" onclick={copyLink}>
				<Link size="0.8rem" />
				<span>{copyLabel}</span>
			</button>
			<a href={resolve('/life/meetups')} class="ui-button is-secondary">
				<List size="0.8rem" />
				<span>목록</span>
			</a>
			{#if data.permissions.canDelete}
				<InlineActionForm
					actionName="delete"
					buttonClass="ui-button is-icon is-danger"
					buttonLabel="일정 삭제"
					confirmMessage="이 일정과 모든 응답을 삭제합니다. 계속할까요?"
				>
					<Trash size="1rem" />
				</InlineActionForm>
			{/if}
		</div>
	</PageHeader>

	<div class="panel-tabs">
		<ChoiceTabs name="panel" options={PANEL_OPTIONS} bind:value={panel} />
	</div>

	<div class="meetup-board">
		<div class="panel" class:is-active={panel === 'mine'}>
			<MyAvailability
				{meetup}
				{savedSlots}
				bind:selected
				classMeetings={data.classMeetings}
				timetableTerm={data.timetableTerm}
			/>
		</div>
		<div class="panel" class:is-active={panel === 'group'}>
			<GroupAvailability {meetup} {responses} />
		</div>
	</div>
</section>

<style lang="scss">
	@use '$style/media';

	.actions {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.4rem;
		white-space: nowrap;
	}

	.panel-tabs {
		display: none;
	}

	.meetup-board {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: start;
		gap: 1rem;
	}

	@include media.mobile {
		.panel-tabs {
			display: block;
		}

		.meetup-board {
			grid-template-columns: minmax(0, 1fr);
		}

		.panel:not(.is-active) {
			display: none;
		}
	}
</style>
