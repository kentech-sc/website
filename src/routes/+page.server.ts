import * as HomeUsecase from '$lib/usecase/home.usecase.js';
// import { convertProfessorIdsToString } from '$lib/repositories/review.repository.js';
// import { setAllUserPoints } from '$lib/repositories/user.repository.js';
// import { convertPostIdsToString } from '$lib/repositories/post.repository.js';
// import { convertArticleIdsToStringInFileMetas } from '$lib/repositories/file-meta.repository.js';


export const load = async () => {
	// await convertProfessorIdsToString();
	// await setAllUserPoints();
	// await convertPostIdsToString();
	// await convertArticleIdsToStringInFileMetas();
	return await HomeUsecase.getHomeData();
};
