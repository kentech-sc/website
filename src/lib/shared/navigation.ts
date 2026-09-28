import { resolve } from '$app/paths';
import { BOARD_DEFINITIONS } from '$lib/shared/board.js';
import { BoardId } from '$lib/types/board.type.js';

export type NavigationLink = {
	label: string;
	href: string;
	notice?: string;
	external?: boolean;
};

export type NavigationItem = NavigationLink | { label: string; children: NavigationLink[] };

export function getMainNavigation(options: {
	canManageOfferings: boolean;
	canAccessAdmin: boolean;
	laundryUrl: string | null;
}): NavigationItem[] {
	const boardLinks = [BoardId.Notice, BoardId.Free].map((boardId) => ({
		label: BOARD_DEFINITIONS[boardId].title,
		href: resolve('/boards/[boardId=board]', { boardId })
	}));

	const academicLinks: NavigationLink[] = [
		{ label: '성적·졸업', href: resolve('/academic/records') },
		{ label: '시간표', href: resolve('/academic/timetable') },
		{ label: '강의평가', href: resolve('/academic/reviews') }
	];
	if (options.canManageOfferings) {
		academicLinks.push({ label: '개설 강의 관리', href: resolve('/academic/offerings') });
	}

	return [
		{ label: '게시판', children: boardLinks },
		{ label: '학사', children: academicLinks },
		{
			label: '총학',
			children: [
				{ label: BOARD_DEFINITIONS[BoardId.Bylaw].title, href: resolve('/bylaws') },
				{ label: '청원', href: resolve('/channel/petitions') },
				{ label: '문의·건의', href: resolve('/channel/feedback') },
				{ label: '익명 제보', href: 'https://forms.gle/k68tcwkFzvnb4qM36' }
			]
		},
		{
			label: '생활',
			children: [
				{
					label: '세탁실 현황',
					href: options.laundryUrl ?? `${resolve('/profile')}#personal-info`,
					external: true,
					notice: options.laundryUrl
						? undefined
						: '세탁실을 이용하려면 프로필에서 성별과 하우스를 먼저 설정해 주세요.'
				},
				{
					label: 'RC 공간 예약',
					href: 'https://docs.google.com/spreadsheets/d/1C2a9azE5e7dko6Vpmc55ww4E64sJFT1xa0--eAyoXrw/edit?gid=348777621#gid=348777621'
				},
				{
					label: 'RC 프로그램 신청',
					href: 'https://cps.kentech.ac.kr/usr/lecture/1/all/B/lectureList'
				}
			]
		},
		...(options.canAccessAdmin ? [{ label: '관리', href: resolve('/admin') }] : [])
	];
}
