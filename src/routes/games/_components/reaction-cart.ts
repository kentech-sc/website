import { REACTION_ROUNDS } from '$lib/shared/games.js';

// 2026 봄학기 학사편람 38–44쪽의 2026년 1·2학기 정규 개설 교과목.
const COMMON_COURSES = [
	'Visionary Course - 에너지 변환 디자인',
	'Visionary Course - 에너지 활용 디자인',
	'Visionary Course - 에너지 관리 디자인',
	'일반물리학 1: 역학 및 전자기학',
	'일반물리학 2: 열물리와 현대물리',
	'일반화학 1',
	'일반화학 2',
	'공학 미적분학',
	'벡터 미적분학과 선형대수학',
	'공업수학 1',
	'공업수학 2',
	'데이터 리터러시 기초',
	'인공지능 프로그래밍 기초',
	'ESP 중급 쓰기',
	'ESP 중급 말하기',
	'ESP고급 쓰기',
	'ESP 고급 말하기',
	'개별연구 1',
	'개별연구 2',
	'글로벌 연구',
	'캡스톤 설계: 자율주제',
	'캡스톤 설계: 지정주제',
	'지식재산과 가치창출',
	'기업가정신과 창업',
	'실전창업',
	'RC 체육',
	'RC 피지컬 트레이닝',
	'RC 팀스포츠'
];

const FIRST_SEMESTER_ONLY = [
	'기초회로이론',
	'전자기학',
	'제어 이론과 응용',
	'반도체소자',
	'전력전자',
	'전력시스템경제',
	'재료과학 기초',
	'물리화학',
	'화학 및 생물 공정 기초',
	'생물과학',
	'전달현상',
	'나노공학',
	'고분자공학',
	'전기화학',
	'원자력 에너지 공학',
	'핵융합공학',
	'컴퓨터 구조와 시스템',
	'자료구조',
	'알고리즘',
	'심층학습 개론',
	'강화학습',
	'전략적 학습과 리더십',
	'시스템 이론과 사회',
	'인간의 마음과 사회 변화',
	'에너지시장경제학',
	'RC 신입생 세미나 1',
	'RC Student-Led-Program 2'
];

const SECOND_SEMESTER_ONLY = [
	'네트워크과학',
	'전자회로',
	'전기기기',
	'최적화이론',
	'전력시스템공학',
	'유체역학',
	'열역학',
	'결정구조와 결함',
	'유기화학',
	'반응공학 및 분리공정',
	'통계역학',
	'무기화학',
	'기기분석 및 계측',
	'에너지와 지구환경 변화',
	'컴퓨터 과학을 위한 수학 기초',
	'기계학습 개론',
	'컴퓨터 비전',
	'자연어 처리',
	'창의적 사고와 비판적 사고의 응용',
	'해석, 커뮤니케이션, 디자인 사고',
	'현대 경제학적 사고와 공공 정책',
	'공학윤리',
	'과학사 및 과학커뮤니케이션 이해',
	'미시경제학 원리',
	'RC 사회공헌'
];

export function pickReactionCourses(): string[] {
	const semesterCourses = Math.random() < 0.5 ? FIRST_SEMESTER_ONLY : SECOND_SEMESTER_ONLY;
	const courses = [...COMMON_COURSES, ...semesterCourses];
	for (let index = 0; index < REACTION_ROUNDS; index++) {
		const next = index + Math.floor(Math.random() * (courses.length - index));
		[courses[index], courses[next]] = [courses[next], courses[index]];
	}
	return courses.slice(0, REACTION_ROUNDS);
}
