import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = () => {
	return new Response(
		"alert('KIS 이수내역 추출 북마크가 업데이트되었습니다. KENTECH 학업 페이지에서 북마크를 다시 가져와 주세요.');",
		{
			headers: {
				'content-type': 'application/javascript; charset=utf-8',
				'cache-control': 'no-store'
			}
		}
	);
};
