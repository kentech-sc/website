// HTML 태그의 <, > 를 이스케이프해서 출력용 문자열로 변환
export function ignoreHtml(content: string): string {
	return content.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

// 이스케이프된 &lt; &gt; 를 다시 실제 HTML 태그로 되돌림
export function normalizeHtml(content: string): string {
	return content.replaceAll('&lt;', '<').replaceAll('&gt;', '>');
}

// 맵 내의 배열에 값 추가 (key가 없으면 배열 생성)
export function addItemToArrInMap<K, V>(map: Map<K, V[]>, key: K, value: V) {
	const arr = map.get(key);
	if (arr) arr.push(value);
	else map.set(key, [value]);
}

// 배열에서 특정 item 을 맨 앞으로 이동
export function moveItemToFirstInArr<T>(arr: T[], item: T): void {
	if (arr.includes(item)) {
		arr.splice(arr.indexOf(item), 1);
		arr.splice(0, 0, item);
	}
}

// 배열에서 특정 item 을 맨 뒤로 이동
export function moveItemToLastInArr<T>(arr: T[], item: T): void {
	if (arr.includes(item)) {
		arr.splice(arr.indexOf(item), 1);
		arr.push(item);
	}
}

// 이전 배열에는 없고 다음 배열에만 있는 항목들을 반환
export function getDiffArr<T>(prevArr: T[], nextArr: T[]): T[] {
	const set = new Set(prevArr);
	return nextArr.filter((x) => !set.has(x));
}

// 두 배열이 같은 값들로 구성되어 있는지 비교
export function isSameArr<T>(arr1: T[], arr2: T[]): boolean {
	if (arr1.length !== arr2.length) return false;

	const a = [...arr1].sort();
	const b = [...arr2].sort();
	return a.every((v, i) => v === b[i]);
}

// 문자열의 UTF-8 바이트 수 계산
export function calcByte(s: string): number {
	let bytes = 0;
	for (const char of s) {
		const code = char.charCodeAt(0);
		if (code <= 0x7f) bytes += 1;
		else if (code <= 0x7ff) bytes += 2;
		else bytes += 3;
	}
	return bytes;
}

/* Date 객체나 문자열을 특정 형식의 문자열로 변환
 - type: 'datetime' → (YYYY/MM/DD HH:mm)
 - type: 'date' → (YYYY-MM-DD, ISO 형식)
 - type: 'time' → (HH:mm)
 */
export function parseDate(
	date: Date | string,
	type: 'date' | 'datetime' | 'time' = 'datetime'
): string {
	if (typeof date === 'string') date = new Date(date);

	const pad = (n: number) => n.toString().padStart(2, '0');

	if (type === 'datetime')
		return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(
			date.getHours()
		)}:${pad(date.getMinutes())}`;

	if (type === 'date') return date.toISOString().split('T')[0];

	if (type === 'time') return `${pad(date.getHours())}:${pad(date.getMinutes())}`;

	return '???';
}

// 숫자 + 알파벳 + 한글 자음 배열 (정렬용)
export const choseongArr: string[] = [
	'0',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
	'P',
	'Q',
	'R',
	'S',
	'T',
	'U',
	'V',
	'W',
	'X',
	'Y',
	'Z',
	'ㄱ',
	'ㄲ',
	'ㄴ',
	'ㄷ',
	'ㄸ',
	'ㄹ',
	'ㅁ',
	'ㅂ',
	'ㅃ',
	'ㅅ',
	'ㅆ',
	'ㅇ',
	'ㅈ',
	'ㅉ',
	'ㅊ',
	'ㅋ',
	'ㅌ',
	'ㅍ',
	'ㅎ'
];
