<script lang="ts">
	import type { FilePresence } from '$lib/types/general.type.js';
	import type { Petition } from '$lib/types/petition.type.js';

	import CommonListBtnModule from '$components/CommonListBtnModule.svelte';
	import FileAttachmentIcons from '$components/FileAttachmentIcons.svelte';
	import MobileListItem from '$components/MobileListItem.svelte';
	import { parseDate, parseRelativeDate } from '$lib/shared/utils.js';
	import { colorStatus, translatedStatus } from '$lib/shared/view.js';

	let {
		petitions,
		filePresence,
		currentPage,
		totalPages
	}: {
		petitions: Petition[];
		filePresence: FilePresence;
		currentPage: number;
		totalPages: number;
	} = $props();
</script>

{#snippet PetitionItem(petition: Petition)}
	<tr>
		<td>
			<a class="petition-title-link" href="/petition/{petition._id}">
				<span class="petition-status" style="color: {colorStatus[petition.status]}"
					>[{translatedStatus[petition.status]}]</span
				>
				<span>{petition.title}</span>
				<FileAttachmentIcons
					hasImage={filePresence[petition._id.toString()]?.hasImage}
					hasFile={filePresence[petition._id.toString()]?.hasFile}
				/>
			</a>
		</td>
		<td>{petition.petitionerName}</td>
		<td>{parseDate(petition.createdAt)}</td>
		<td>{petition.viewCnt}</td>
		<td>{petition.signedBy.length}</td>
	</tr>
{/snippet}

{#snippet PetitionResponse(petition: Petition)}
	{#if petition.answeredAt}
		<tr class="petition-response-row">
			<td>
				<a class="petition-response-link" href="/petition/{petition._id}#response-section"
					>ㄴ <span style="color: purple">[답변]</span> {petition.title}</a
				>
			</td>
			<td>{petition.responderName}</td>
			<td>{parseDate(petition.answeredAt)}</td>
			<td>-</td>
			<td>-</td>
		</tr>
	{/if}
{/snippet}

<section class="container-col module desktop-list-shell">
	<table class="data-table">
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
				<th>청원인</th>
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
	<CommonListBtnModule {currentPage} {totalPages} />
</section>

<section class="container-col module mobile-list-shell">
	{#each petitions as petition (petition._id)}
		<MobileListItem href="/petition/{petition._id}">
			{#snippet row1()}
				<span class="petition-mobile-status" style="color: {colorStatus[petition.status]}"
					>[{translatedStatus[petition.status]}]</span
				>
				<span class="title">{petition.title}</span>
				<FileAttachmentIcons
					hasImage={filePresence[petition._id.toString()]?.hasImage}
					hasFile={filePresence[petition._id.toString()]?.hasFile}
				/>
			{/snippet}
			{#snippet row2()}
				<span class="meta"
					>{petition.petitionerName} | 조회 {petition.viewCnt} | 동의 {petition.signedBy
						.length}</span
				>
				<span class="time">{parseRelativeDate(petition.createdAt)}</span>
			{/snippet}
		</MobileListItem>
	{/each}
	<CommonListBtnModule {currentPage} {totalPages} />
</section>

<style lang="scss">
	.petition-title-link {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.2rem;
	}

	.petition-status {
		font-size: 0.7rem;
	}

	.petition-response-row td {
		font-weight: 400;
		color: var(--gray-text);
	}

	.petition-response-link {
		color: var(--text);
	}

	.mobile-list-shell {
		:global(.petition-mobile-status) {
			flex-shrink: 0;
			font-size: 0.7rem;
			font-weight: bold;
		}
	}
</style>
