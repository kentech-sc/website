import * as PostService from '$lib/srv/post.srv.js';
import * as ReviewService from '$lib/srv/review.srv.js';
import * as PetitionService from '$lib/srv/petition.srv.js';

export async function search(query: string, page: number, limit: number) {
	const postResults = await PostService.searchPostByQuery(query ?? '', page, limit);
	const reviewResults = await ReviewService.searchReviewByQuery(query ?? '', page, limit);
	const petitionResults = await PetitionService.searchPetitionByQuery(query ?? '', page, limit);

	const more = postResults.more || reviewResults.more || petitionResults.more;

	const results = [...postResults.items, ...reviewResults.items, ...petitionResults.items];

	results.sort((a, b) => {
		if ('searchScore' in a && 'searchScore' in b) {
			const deltaScore = (b.searchScore as number) - (a.searchScore as number);
			if (deltaScore !== 0) return deltaScore;

			if ('createdAt' in a && 'createdAt' in b) {
				const deltaDate = (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime();
				if (deltaDate !== 0) return deltaDate;
			}
		}
		return 0;
	});

	return { results, more };
}
