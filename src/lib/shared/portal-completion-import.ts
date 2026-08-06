import { resolveCompletionStatus } from './completion-status.js';

import type { CompletionStatus } from '$lib/types/academic.type.js';

export interface PortalCompletionImportRow {
	/** KIS가 알려주는 이수구분. 졸업요건 영역인지는 사용하는 쪽에서 판단한다. */
	category: string;
	courseId: string;
	courseName: string;
	credits: number;
	grade: string;
	status: CompletionStatus;
	year: number;
	term: number;
}

export interface PortalCompletionParseResult {
	rows: PortalCompletionImportRow[];
	skippedCount: number;
}

// 학교마다 코드 체계가 달라 형태를 제한하지 않는다. 이 값이 곧 강의 PK라 공백과 길이만 막는다.
const COURSE_CODE_RE = /^\S{1,20}$/;

/**
 * KIS 과목명은 학기마다 공백·번호 등 잡음이 붙어 정확히 일치하지 않을 수 있다.
 * 개별 잡음을 하나씩 다듬는 대신, 한쪽이 다른 쪽을 포함하면 같은 과목으로 본다.
 */
export function isSameCourseName(left: string, right: string): boolean {
	const a = left.replace(/\s+/g, '').toLowerCase();
	const b = right.replace(/\s+/g, '').toLowerCase();
	return a.length > 0 && b.length > 0 && (a.includes(b) || b.includes(a));
}

function parsePeriod(value: string): { year: number; term: number } | null {
	const normalized = value.replace(/\s+/g, ' ').trim();
	const yearMatch = normalized.match(/(20\d{2})/);
	if (!yearMatch) return null;
	const year = Number(yearMatch[1]);
	const lower = normalized.toLowerCase();
	if (/(하계|여름|summer)/i.test(normalized)) return { year, term: 3 };
	if (/(동계|겨울|winter)/i.test(normalized)) return { year, term: 4 };
	if (/(^|[-_\s])spring($|[-_\s])/.test(lower) || /1\s*학기/.test(normalized))
		return { year, term: 1 };
	if (/(^|[-_\s])fall($|[-_\s])/.test(lower) || /2\s*학기/.test(normalized))
		return { year, term: 2 };
	return null;
}

/**
 * Parses the tab-separated text produced by the KIS extraction script.
 * Expected columns: category, course code, course name, credits, grade, period.
 */
export function parsePortalCompletionText(text: string): PortalCompletionParseResult {
	const rows: PortalCompletionImportRow[] = [];
	const seen = new Set<string>();
	let skippedCount = 0;

	for (const rawLine of text.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line) continue;
		const columns = line.split('\t').map((column) => column.trim());
		if (columns.length < 6) {
			skippedCount += 1;
			continue;
		}

		const courseId = columns[1]?.toUpperCase();
		const courseName = columns[2] || courseId;
		const credits = Number.parseFloat(columns[3]);
		const grade = columns[4]?.toUpperCase();
		const period = parsePeriod(columns[5]);
		if (
			!courseId ||
			!COURSE_CODE_RE.test(courseId) ||
			!Number.isFinite(credits) ||
			credits < 0 ||
			!grade ||
			!period
		) {
			skippedCount += 1;
			continue;
		}

		const key = `${courseId}:${period.year}:${period.term}`;
		if (seen.has(key)) continue;
		seen.add(key);
		rows.push({
			category: columns[0].toUpperCase(),
			courseId,
			courseName,
			credits,
			grade,
			status: resolveCompletionStatus(grade, 'passed'),
			year: period.year,
			term: period.term
		});
	}

	return { rows, skippedCount };
}

export const KIS_COMPLETION_EXTRACTOR = String.raw`(async function () {
  const seen = new Set();
  const rows = [];
  const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
  const text = (element) => (element?.innerText || element?.textContent || '').trim();
  const period = (value) => {
    const normalized = value.replace(/\s+/g, ' ').trim();
    let match = normalized.match(/(20\d{2})(?:학년도)?\s*(1|2)\s*학기/);
    if (match) return match[1] + (match[2] === '1' ? '-spring' : '-fall');
    match = normalized.match(/(20\d{2})(?:학년도)?\s*(하계|여름|동계|겨울)(?:계절)?학기/);
    if (match) return match[1] + (/하계|여름/.test(match[2]) ? '-summer' : '-winter');
    return '';
  };
  const semesterFor = (grid) => {
    let sibling = grid.previousElementSibling;
    for (let count = 0; sibling && count < 8; count += 1, sibling = sibling.previousElementSibling) {
      const parsed = period(text(sibling));
      if (parsed) return parsed;
    }
    return '';
  };
  const extract = () => document.querySelectorAll('[role="grid"]').forEach((grid) => {
    const semester = semesterFor(grid);
    if (!semester) return;
    grid.querySelectorAll('[role="row"]').forEach((row) => {
      const cells = {};
      row.querySelectorAll('[role="gridcell"]').forEach((cell) => {
        const index = Number(cell.getAttribute('aria-colindex'));
        if (index) cells[index] = text(cell.querySelector('.cl-text') || cell);
      });
      const code = cells[2];
      const key = code + ':' + semester;
      if (!code || seen.has(key)) return;
      seen.add(key);
      rows.push([cells[1] || '', code, cells[3] || '', cells[4] || '', cells[5] || '', semester].join('\t'));
    });
  });
  const grids = Array.from(document.querySelectorAll('[role="grid"]'));
  const scrollable = (element) =>
    element instanceof HTMLElement &&
    element.clientHeight > 0 &&
    element.scrollHeight > element.clientHeight + 2;
  const scrollers = new Set();
  grids.forEach((grid) => {
    [grid, ...grid.querySelectorAll('*')].forEach((element) => {
      if (scrollable(element)) scrollers.add(element);
    });
    let ancestor = grid.parentElement;
    for (let depth = 0; ancestor && depth < 10; depth += 1, ancestor = ancestor.parentElement) {
      if (scrollable(ancestor)) scrollers.add(ancestor);
      ancestor.querySelectorAll('[class*="scroll"], [role="scrollbar"]').forEach((element) => {
        if (scrollable(element)) scrollers.add(element);
        if (scrollable(element.parentElement)) scrollers.add(element.parentElement);
      });
    }
  });
  const scrollAndExtract = async (scroller) => {
    const originalTop = scroller.scrollTop;
    const notify = () => scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
    scroller.scrollTop = 0;
    notify();
    await wait(100);
    extract();
    for (let step = 0; step < 300; step += 1) {
      const maximum = scroller.scrollHeight - scroller.clientHeight;
      const current = scroller.scrollTop;
      if (current >= maximum - 2) break;
      const next = Math.min(maximum, current + Math.max(60, Math.floor(scroller.clientHeight * 0.75)));
      scroller.scrollTop = next;
      notify();
      await wait(80);
      extract();
      if (scroller.scrollTop <= current && next > current) break;
    }
    scroller.scrollTop = Math.min(originalTop, scroller.scrollHeight - scroller.clientHeight);
    notify();
    await wait(50);
  };
  for (const scroller of scrollers) await scrollAndExtract(scroller);
  extract();
  if (!rows.length) {
    alert('과목 정보를 찾지 못했습니다. KIS 전체성적조회 화면에서 실행해주세요.');
    return;
  }
  const output = rows.join('\n');
  navigator.clipboard.writeText(output).then(
    () => alert(rows.length + '개 수강 과목을 복사했습니다.'),
    () => window.prompt('내용 칸을 클릭한 뒤 Ctrl+A, Ctrl+C로 복사하세요.', output)
  );
})();`;

const BOOKMARKLET_SCRIPT_PATH = '/portal-completion-bookmarklet.js';

/**
 * javascript: URL 자체 길이 제한(구형 브라우저 기준 ~2083자)을 피하려고,
 * 추출 로직 전체 대신 매 클릭마다 최신 스크립트를 fetch하는 짧은 로더만 담는다.
 */
export function buildKisCompletionBookmarkletHref(origin: string): string {
	const scriptUrl = `${origin}${BOOKMARKLET_SCRIPT_PATH}`;
	return `javascript:(function(){var d=document,s=d.createElement('script');s.src=${JSON.stringify(scriptUrl)}+'?t='+Date.now();d.body.appendChild(s);})();`;
}
