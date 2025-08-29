export default class GeneralUtils {
	static ignoreHtml(content: string): string {
		return content.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
	}

	static normalizeHtml(content: string): string {
		return content.replaceAll('&lt;', '<').replaceAll('&gt;', '>');
	}

	static addItemToArrInMap<K, V>(map: Map<K, V[]>, key: K, value: V): void {
		if (map.has(key)) {
			(map.get(key) || []).push(value);
		} else {
			map.set(key, [value]);
		}
	}

	static moveItemToFirstInArr<T>(arr: T[], item: T): void {
		if (arr.includes(item)) {
			arr.splice(arr.indexOf(item), 1);
			arr.splice(0, 0, item);
		}
	}

	static moveItemToLastInArr<T>(arr: T[], item: T): void {
		if (arr.includes(item)) {
			arr.splice(arr.indexOf(item), 1);
			arr.push(item);
		}
	}

	static getDiffArr<T>(prevArr: T[], nextArr: T[]): T[] {
		return nextArr.reduce<T[]>((diffArr, item) => {
			if (prevArr.indexOf(item) === -1) {
				diffArr.push(item);
			}
			return diffArr;
		}, []);
	}

	static isSameArr<T>(arr1: T[], arr2: T[]): boolean {
		arr1.sort();
		arr2.sort();
		if (arr1.length !== arr2.length) return false;
		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) return false;
		}
		return true;
	}

	static calcByte(s: string, b?: number, i?: number, c?: number): number {
		for (b = i = 0; (c = s.charCodeAt(i++)); b += c >> 11 ? 3 : c >> 7 ? 2 : 1);
		return b;
	}

	static parseDate(date: Date | string, type: 'date' | 'datetime' | 'time' = 'datetime'): string {
		if (typeof date === 'string') date = new Date(date);
		if (type === 'datetime')
			return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
		if (type === 'date') return date.toISOString().split('T')[0];
		if (type === 'time') {
			if (date.getMinutes() < 10) {
				return `${date.getHours()}:0${date.getMinutes()}`;
			} else {
				return `${date.getHours()}:${date.getMinutes()}`;
			}
		}
		return '???';
	}

	static choseongArr: string[] = [
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
}
