import * as PetitionService from '$lib/services/petition.service.js';
import * as PostService from '$lib/services/post.service.js';
import * as ReviewService from '$lib/services/review.service.js';

export async function search(query: string, page: number, limit: number) {
	const candidateLimit = page * limit + 1;
	const start = (page - 1) * limit;
	const end = start + limit;

	const postResults = await PostService.searchPostsByQuery(query, 1, candidateLimit);
	const reviewResults = await ReviewService.searchReviewsByQuery(query, 1, candidateLimit);
	const petitionResults = await PetitionService.searchPetitionsByQuery(query, 1, candidateLimit);

	const mergedResults = [...postResults.items, ...reviewResults.items, ...petitionResults.items];

	mergedResults.sort((a, b) => {
		if ('searchScore' in a && 'searchScore' in b) {
			const deltaScore = (b.searchScore as number) - (a.searchScore as number);
			if (deltaScore !== 0) return deltaScore;
		}

		if ('createdAt' in a && 'createdAt' in b) {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		}

		return 0;
	});

	const results = mergedResults.slice(start, end);
	const more =
		mergedResults.length > end || postResults.more || reviewResults.more || petitionResults.more;

	return { results, more };
}
