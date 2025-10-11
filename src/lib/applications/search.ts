import BoardService from '$lib/board/service';
import ReviewService from '$lib/review/service';
import PetitionService from '$lib/petition/service';

export default class SearchApplication {
	static async search(query: string, page: number, limit: number) {
		const boardResults = await BoardService.searchPostByQuery(query ?? '', page, limit);
		const reviewResults = await ReviewService.searchReviewByQuery(query ?? '', page, limit);
		const petitionResults = await PetitionService.searchPetitionByQuery(query ?? '', page, limit);

		const more = boardResults.more || reviewResults.more || petitionResults.more;

		const results = [...boardResults.items, ...reviewResults.items, ...petitionResults.items];

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
}
