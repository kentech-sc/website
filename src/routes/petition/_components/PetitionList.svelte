<script lang="ts">
	import type { Petition } from '$lib/types/petition.type.js';

	import CommonListBtnModule from '$components/CommonListBtnModule.svelte';

	import * as PetitionService from '$lib/srv/petition.srv.js';
	import * as CommonUtils from '$lib/common/utils.js';

	let { petitions, toId, fromId } = $props();
</script>

{#snippet PetitionItem(petition: Petition)}
	<tr>
		<td class="title-td"
			><a href="/petition/{petition._id}">
				<span style="color: {PetitionService.colorStatus[petition.status]}"
					>[{PetitionService.translatedStatus[petition.status]}]</span
				>
				{petition.title}</a
			></td
		>
		<td>{petition.petitionerName}</td>
		<td>{CommonUtils.parseDate(petition.createdAt)}</td>
		<td>{petition.viewCnt}</td>
		<td>{petition.signCnt}</td>
	</tr>
{/snippet}

{#snippet PetitionResponse(petition: Petition)}
	{#if petition.answeredAt}
		<tr>
			<td class="response-td"
				><a href="/petition/{petition._id}#response-section"
					>↳ <span style="color: purple">[답변]</span> {petition.title}</a
				></td
			>
			<td>{petition.responderName}</td>
			<td>{CommonUtils.parseDate(petition.answeredAt)}</td>
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
	<CommonListBtnModule pageName="petition" {toId} {fromId} />
</section>

<style lang="scss">
	table {
		width: stretch;

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

		tbody > tr:nth-child(2n + 1) > td {
			background-color: var(--gray-bg);
		}

		td:nth-child(n) {
			text-align: center;
		}

		td:first-child {
			text-align: left;
		}

		td:first-child {
			font-weight: bold;
			a {
				color: black;
			}
		}
	}
</style>
