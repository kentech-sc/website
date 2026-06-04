import * as HomeUsecase from '$lib/usecase/home.usecase.js';

export const load = async () => {
	return await HomeUsecase.getHomeData();
};
