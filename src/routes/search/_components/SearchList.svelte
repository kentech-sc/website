<script lang="ts">
	import type { Page, SearchEntity } from '$lib/types/general.type.js';
	import type { PostEntity } from '$lib/types/post.type.js';
	import type { ReviewEntity } from '$lib/types/review.type.js';
	import type { SubmissionEntity } from '$lib/types/submission.type.js';

	import { resolve } from '$app/paths';
	import PaginatedList from '$components/PaginatedList.svelte';
	import { boardPostPath } from '$lib/shared/paths.js';
	import { SUBMISSION_KIND_LABELS } from '$lib/shared/submission.js';
	import { getPlainTextFromHtml } from '$lib/shared/utils.js';

	let {
		searchPage
	}: {
		searchPage: Page<SearchEntity>;
	} = $props();
</script>

{#snippet ListItem(item: PostEntity | SubmissionEntity | ReviewEntity)}
	{@const href =
		'boardId' in item
			? boardPostPath(item.boardId, item.id.toString())
			: 'offeringId' in item
				? resolve('/academic/reviews/[reviewId]', { reviewId: item.id.toString() })
				: item.kind === 'petition'
					? resolve('/channel/petitions/[submissionId]', { submissionId: item.id.toString() })
					: resolve('/channel/feedback/[submissionId]', { submissionId: item.id.toString() })}
	{@const kind =
		'boardId' in item
			? '게시글'
			: 'offeringId' in item
				? '강의평가'
				: SUBMISSION_KIND_LABELS[item.kind]}
	{@const summary = getPlainTextFromHtml('offeringId' in item ? item.comment : item.content)}
	<a class="content-list-item" {href}>
		<header><strong><span>{kind}</span>{item.title}</strong></header>
		<footer><span>{summary}</span></footer>
	</a>
{/snippet}

<PaginatedList page={searchPage} emptyMessage="검색 결과가 없습니다.">
	{#snippet item(value)}{@render ListItem(value)}{/snippet}
</PaginatedList>

<style>
	strong > span {
		margin-right: 0.4rem;
		color: var(--secondary);
		font-size: 0.7rem;
	}
</style>
