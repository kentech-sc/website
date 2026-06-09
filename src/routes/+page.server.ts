import * as HomeUsecase from '$lib/usecase/home.usecase.js';
// import { convertProfessorIdsToString } from '$lib/repositories/review.repository.js';
// import { setAllUserPoints } from '$lib/repositories/user.repository.js';
// import { convertPostIdsToString } from '$lib/repositories/post.repository.js';


export const load = async () => {
	return await HomeUsecase.getHomeData();
};
