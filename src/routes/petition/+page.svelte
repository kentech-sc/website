<script lang="ts">
	import GeneralUtils from '$lib/general/utils.js';
	import type { Petition } from '$lib/petition/types.js';
	import PetitionService from '$lib/petition/service';

	let { data } = $props();
	const petitions = $state<Petition[]>(JSON.parse(data?.petitions || '[]'));
</script>

{#snippet HeaderModule()}
	<header class="container module">
		<h1>청원</h1>
		<a href="/petition/new">청원하기</a>
	</header>
{/snippet}

{#snippet NoticeModule()}
	<section class="module">
		<p>(대충 주의사항)</p>
	</section>
{/snippet}

{#snippet PetitionItem(petition: Petition)}
	<tr>
		<td class="title-td"
			><a href={`/petition/${petition._id}`}
				><b
					><span style="color: {PetitionService.colorStatus[petition.status]}"
						>[{PetitionService.translatedStatus[petition.status]}]</span
					></b
				>
				{petition.title}</a
			></td
		>
		<td>{petition.petitionerName}</td>
		<td>{GeneralUtils.parseDate(petition.createdAt)}</td>
		<td>{petition.viewCnt}</td>
		<td>{petition.signCnt}</td>
	</tr>
{/snippet}

{#snippet PetitionResponse(petition: Petition)}
	{#if petition.answeredAt}
		<tr>
			<td class="response-td"
				><a href={`/petition/${petition._id}#response-section`}
					>↳ <span style="color: purple">[답변]</span> {petition.title}</a
				></td
			>
			<td>{petition.responderName}</td>
			<td>{GeneralUtils.parseDate(petition.answeredAt)}</td>
			<td>-</td>
			<td>-</td>
		</tr>
	{/if}
{/snippet}

{#snippet ListModule()}
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
	</section>
{/snippet}

{@render HeaderModule()}
{@render NoticeModule()}
{@render ListModule()}

<style lang="scss">
	section {
		width: stretch;
		margin: 0.5rem;
	}

	header {
		width: stretch;
		margin: 0.5rem;
		justify-content: space-between;
	}

	table {
		width: stretch;

		td,
		th {
			padding: 0.5rem;
		}

		td:nth-child(n) {
			text-align: center;
		}

		td:first-child {
			text-align: left;
		}

		.title-td > a {
			font-weight: bold;
			color: black;
		}

		.response-td > a {
			font-weight: bold;
			color: black;
		}
	}
</style>
