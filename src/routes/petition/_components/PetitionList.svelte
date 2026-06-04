<script lang="ts">
	import CommonListBtnModule from '$components/CommonListBtnModule.svelte';
	import FileAttachmentIcons from '$components/FileAttachmentIcons.svelte';
	import MobileListItem from '$components/MobileListItem.svelte';

	import type { FilePresence } from '$lib/types/general.type.js';
	import type { Petition } from '$lib/types/petition.type.js';

	import { parseDate, parseRelativeDate } from '$lib/shared/utils.js';
	import { colorStatus, translatedStatus } from '$lib/shared/view.js';

	let {
		petitions,
		filePresence,
		prevHref,
		nextHref
	}: { petitions: Petition[]; filePresence: FilePresence; prevHref?: string; nextHref?: string } =
		$props();
</script>

{#snippet PetitionItem(petition: Petition)}
	<tr>
		<td class="title-td">
			<a href="/petition/{petition._id}">
				<span style="color: {colorStatus[petition.status]}"
					>[{translatedStatus[petition.status]}]</span
				>
				{petition.title}
				<FileAttachmentIcons
					hasImage={filePresence[petition._id.toString()]?.hasImage}
					hasFile={filePresence[petition._id.toString()]?.hasFile}
				/>
			</a>
		</td>
		<td>{petition.petitionerName}</td>
		<td>{parseDate(petition.createdAt)}</td>
		<td>{petition.viewCnt}</td>
		<td>{petition.signCnt}</td>
	</tr>
{/snippet}

{#snippet PetitionResponse(petition: Petition)}
	{#if petition.answeredAt}
		<tr>
			<td class="response-td">
				<a href="/petition/{petition._id}#response-section"
					>↳ <span style="color: purple">[답변]</span> {petition.title}</a
				>
			</td>
			<td>{petition.responderName}</td>
			<td>{parseDate(petition.answeredAt)}</td>
			<td>-</td>
			<td>-</td>
		</tr>
	{/if}
{/snippet}

<section class="container-col module">
	<table>
		<colgroup>
			<col style="width:50%" />
			<col style="width:16%" />
			<col style="width:20%" />
			<col style="width:7%" />
			<col style="width:7%" />
		</colgroup>
		<thead>
			<tr>
				<th>제목</th>
				<th>작성자</th>
				<th>작성일</th>
				<th>조회</th>
				<th>동의</th>
			</tr>
		</thead>
		<tbody>
			{#each petitions as petition (petition._id)}
				{@render PetitionItem(petition)}
				{@render PetitionResponse(petition)}
			{/each}
		</tbody>
	</table>
	<CommonListBtnModule {prevHref} {nextHref} />
</section>

<section class="container-col module mobile-list">
	{#each petitions as petition (petition._id)}
		<MobileListItem href="/petition/{petition._id}">
			{#snippet row1()}
				<span class="status" style="color: {colorStatus[petition.status]}"
					>[{translatedStatus[petition.status]}]</span
				>
				<span class="title">{petition.title}</span>
				<FileAttachmentIcons
					hasImage={filePresence[petition._id.toString()]?.hasImage}
					hasFile={filePresence[petition._id.toString()]?.hasFile}
				/>
			{/snippet}
			{#snippet row2()}
				<span class="meta">{petition.petitionerName} · 조회 {petition.viewCnt} · 동의 {petition.signCnt}</span>
				<span class="time">{parseRelativeDate(petition.createdAt)}</span>
			{/snippet}
		</MobileListItem>
	{/each}
	<CommonListBtnModule {prevHref} {nextHref} />
</section>

<style lang="scss">
	table {
		width: 100%;

		th {
			word-break: keep-all;
		}

		td,
		th {
			padding: 0.5rem;
			background-color: white;
			border: none;
		}

		thead > tr > th {
			border-bottom: solid var(--gray-border) 0.1rem;
		}

		tbody {
			tr {
				border-bottom: solid var(--gray-border) 0.1rem;
			}

			tr:hover > td {
				background-color: var(--gray-bg);
			}
		}

		td:nth-child(n) {
			text-align: center;
		}

		td:first-child {
			text-align: left;
			font-weight: bold;

			a {
				color: black;
			}
		}
	}

	.mobile-list {
		display: none;
	}

	@media (max-width: 768px) {
		section:not(.mobile-list) {
			display: none;
		}

		.mobile-list {
			display: flex;
			padding: 0;

			:global(.status) {
				flex-shrink: 0;
				font-size: 0.9rem;
				font-weight: bold;
			}
		}
	}
</style>
