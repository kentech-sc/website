export const RECYCLING_DURATION_MS = 30_000;
export const RECYCLING_MAX_ROUNDS = 200;

export const RECYCLING_BINS = [
	{ id: 'paper', label: '종이류', code: 'KeyA', key: 'A' },
	{ id: 'plastic', label: '플라스틱', code: 'KeyS', key: 'S' },
	{ id: 'vinyl', label: '비닐류', code: 'KeyD', key: 'D' },
	{ id: 'can', label: '금속류', code: 'KeyF', key: 'F' },
	{ id: 'glass', label: '유리병', code: 'KeyJ', key: 'J' },
	{ id: 'garbage', label: '음식물', code: 'KeyK', key: 'K' },
	{ id: 'trash', label: '일반쓰레기', code: 'KeyL', key: 'L' },
	{ id: 'other', label: '기타', code: 'Semicolon', key: ';' }
] as const;

export type RecyclingBin = (typeof RECYCLING_BINS)[number]['id'];
export type RecyclingChoice = RecyclingBin | 'clearPet' | 'carton' | 'styrofoam';

export type RecyclingItem = readonly [
	name: string,
	bin: RecyclingChoice,
	subcategory?: string | null,
	neutralBin?: RecyclingBin
];

// Classify household waste by item type. Local collection rules may differ.
export const RECYCLING_ITEMS: readonly RecyclingItem[] = [
	['무색 생수 페트병', 'clearPet', '무색 페트병'],
	['무색 음료 페트병', 'clearPet', '무색 페트병'],

	['음료 캔', 'can'],
	['참치 캔', 'can'],
	['맥주 캔', 'can'],
	['전체가 금속인 가위', 'can'],
	['철사 옷걸이', 'can'],
	['스텐 냄비', 'can'],
	['철제 노트 스프링', 'can'],

	['택배 상자', 'paper'],
	['복사용지', 'paper'],
	['무코팅 과자 상자', 'paper'],
	['휴지심', 'paper'],
	['무코팅 전단지', 'paper'],
	['신문지', 'paper'],
	['노트 속지', 'paper'],
	['종이 완충재', 'paper'],
	['종이봉투', 'paper'],
	['종이 달걀판', 'paper'],
	['피자 상자', 'paper'],

	['우유팩', 'carton', '종이팩'],
	['두유팩', 'carton', '종이팩'],
	['주스 종이팩', 'carton', '종이팩'],

	['나무젓가락', 'trash'],
	['물티슈', 'trash'],
	['감열지 영수증', 'trash'],
	['포장 테이프', 'trash'],
	['화장지', 'trash'],
	['칫솔', 'trash'],
	['비닐 코팅 전단지', 'trash'],
	['비닐 코팅 과자 상자', 'trash'],
	['티백', 'trash'],
	['옥수수 속대', 'trash'],
	['나무 이쑤시개', 'trash'],
	['호두 껍데기', 'trash'],
	['달걀 껍데기', 'trash'],
	['마스크', 'trash'],
	['기저귀', 'trash'],
	['키친타월', 'trash'],
	['콘택트렌즈', 'trash'],
	['부직포 쇼핑백', 'trash'],
	['심하게 찢어진 옷', 'trash'],
	['택배 송장', 'trash'],
	['종이 포일', 'trash'],
	['기름 밴 피자 상자', 'trash'],
	['양념 밴 스티로폼', 'trash'],
	['은박 알약 포장', 'trash'],
	['복숭아 씨', 'trash'],
	['볼펜', 'trash'],

	['잼병', 'glass'],
	['유리 소스병', 'glass'],
	['와인병', 'glass'],
	['유리 식초병', 'glass'],

	['요구르트병', 'plastic'],
	['플라스틱 소스병', 'plastic'],
	['유색 음료 페트병', 'plastic'],
	['요거트컵', 'plastic'],
	['즉석밥 용기', 'plastic', null, 'trash'],
	['플라스틱 배달 용기', 'plastic'],
	['액체 세제통', 'plastic'],
	['플라스틱 달걀판', 'plastic'],
	['가글병', 'plastic'],
	['플라스틱 노트 스프링', 'plastic'],
	['은박 뗀 알약 포장', 'plastic'],

	['과자 봉지', 'vinyl'],
	['비닐 약봉지', 'vinyl'],
	['라면 봉지', 'vinyl'],
	['뽁뽁이', 'vinyl'],
	['양파망', 'vinyl'],
	['비닐 쇼핑백', 'vinyl'],
	['세탁소 비닐', 'vinyl'],
	['택배 비닐봉투', 'vinyl'],
	['페트병 비닐 라벨', 'vinyl'],
	['비닐장갑', 'vinyl'],

	['바나나 껍질', 'garbage'],
	['귤 껍질', 'garbage'],
	['사과 껍질', 'garbage'],
	['남은 밥', 'garbage'],
	['남은 식빵', 'garbage'],
	['삶은 국수', 'garbage'],
	['남은 두부', 'garbage'],
	['남은 김치', 'garbage'],
	['생선 살', 'garbage'],
	['삶은 옥수수 알', 'garbage'],
	['달걀 흰자', 'garbage'],
	['감자 껍질', 'garbage'],
	['고구마 껍질', 'garbage'],

	['흰색 스티로폼 포장재', 'other', '스티로폼'],
	['스티로폼 택배 상자', 'other', '스티로폼'],
	['건전지', 'other', '전지류'],
	['보조배터리', 'other', '전지류'],
	['형광등', 'other', '조명제품'],
	['헤어드라이어', 'other', '소형 폐가전'],
	['전기밥솥', 'other', '소형 폐가전'],
	['전기주전자', 'other', '소형 폐가전'],
	['휴대전화', 'other', '소형 폐가전'],
	['멀쩡한 헌옷', 'other', '의류'],
	['폐식용유', 'other', '폐식용유'],
	['폐의약품', 'other', '폐의약품']
];

export function isRecyclingChoice(value: unknown): value is RecyclingChoice {
	return (
		RECYCLING_BINS.some((bin) => bin.id === value) ||
		value === 'carton' ||
		value === 'clearPet' ||
		value === 'styrofoam'
	);
}

export function gradeRecyclingChoice(
	[, expected, , neutralBin]: RecyclingItem,
	chosen: RecyclingChoice
) {
	const fallback =
		neutralBin ?? (expected === 'carton' ? 'paper' : expected === 'clearPet' ? 'plastic' : null);
	const separate = expected === 'carton' || expected === 'clearPet' || expected === 'styrofoam';
	// Older clients can still answer with the dedicated bin they display.
	const correctBin = separate && chosen !== expected ? 'other' : expected;
	const scoreDelta = chosen === correctBin ? 1 : chosen === fallback ? 0 : -1;
	return { correctBin, scoreDelta } as const;
}

export function pickRecyclingItem(previous: number, random = Math.random): number {
	if (previous < 0) return Math.floor(random() * RECYCLING_ITEMS.length);
	const index = Math.floor(random() * (RECYCLING_ITEMS.length - 1));
	return index >= previous ? index + 1 : index;
}
