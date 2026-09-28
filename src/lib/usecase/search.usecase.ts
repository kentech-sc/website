import type { Page } from '$lib/types/general.type.js';
import type { SearchEntity } from '$lib/types/general.type.js';

import * as FeedbackService from '$lib/services/feedback.service.js';
import * as PetitionService from '$lib/services/petition.service.js';
import * as PostService from '$lib/services/post.service.js';
import * as ReviewService from '$lib/services/review.service.js';
import { createPage } from '$lib/shared/paginate.js';

function omitSearchScore(result: SearchEntity & { searchScore?: number }): SearchEntity {
	const { searchScore: _searchScore, ...entity } = result;
	return entity as SearchEntity;
}

export async function search(
	query: string,
	page: number,
	limit: number
): Promise<Page<SearchEntity>> {
	const skip = (page - 1) * limit;
	const normalizedQuery = query.trim();

	if (!normalizedQuery) return createPage<SearchEntity>([], 0, limit, skip);

	const candidateLimit = skip + limit + 1;
	const [
		postResults,
		reviewResults,
		petitionResults,
		feedbackResults,
		postCount,
		reviewCount,
		petitionCount,
		feedbackCount
	] = await Promise.all([
		PostService.searchPostsByQuery(normalizedQuery, candidateLimit, 0),
		ReviewService.searchReviewsByQuery(normalizedQuery, candidateLimit, 0),
		PetitionService.searchPetitionsByQuery(normalizedQuery, candidateLimit, 0),
		FeedbackService.searchFeedbackByQuery(normalizedQuery, candidateLimit, 0),
		PostService.countPostsByQuery(normalizedQuery),
		ReviewService.countReviewsByQuery(normalizedQuery),
		PetitionService.countPetitionsByQuery(normalizedQuery),
		FeedbackService.countFeedbackByQuery(normalizedQuery)
	]);

	const mergedResults: Array<SearchEntity & { searchScore?: number }> = [
		...postResults,
		...reviewResults,
		...petitionResults,
		...feedbackResults
	];

	mergedResults.sort((a, b) => {
		const deltaScore = (b.searchScore ?? 0) - (a.searchScore ?? 0);
		if (deltaScore !== 0) return deltaScore;

		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});

	const items = mergedResults.slice(skip, skip + limit).map(omitSearchScore);
	const totalCount = postCount + reviewCount + petitionCount + feedbackCount;

	return createPage<SearchEntity>(items, totalCount, limit, skip);
}
