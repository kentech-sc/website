import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { compile } from 'sass';
import { parse } from 'svelte/compiler';

const css = compile('src/style/components.scss').css;
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
function declarations(selector) {
	return rules
		.filter(([, selectors]) => selectors.split(',').some((value) => value.trim() === selector))
		.map(([, , body]) => body)
		.join('');
}

test('버튼 기본 규칙은 상태 배지 스타일과 분리된다', () => {
	const button = declarations('.ui-button');
	assert.match(button, /background: var\(--ui-button-bg/);
	assert.match(button, /justify-content: center/);
	assert.doesNotMatch(button, /border-radius: 999rem/);
	assert.match(declarations('.status-badge'), /border-radius: 999rem/);
});
test('액션 색상과 도구 모음·아이콘 형태가 독립적으로 유지된다', () => {
	assert.match(declarations('.ui-button.is-primary'), /--ui-button-bg: var\(--secondary\)/);
	assert.match(declarations('.ui-button.is-secondary'), /--ui-button-bg: var\(--white\)/);
	assert.match(declarations('.ui-button.is-danger'), /--ui-button-bg: var\(--error-text\)/);
	assert.match(declarations('.ui-button.is-compact'), /font-size: 0.7rem/);
	assert.match(declarations('.ui-button:hover:not(:disabled)'), /--ui-button-hover-bg/);
	assert.match(declarations('.ui-button:disabled'), /cursor: not-allowed/);
});

test('목록 제목 스타일은 목록 밖으로 적용되지 않는다', () => {
	assert.equal(declarations('.title'), '');
	assert.equal(declarations('.metadata'), '');
	assert.match(declarations('.content-list-item > header > strong'), /text-overflow: ellipsis/);
});
test('선택 카드와 입력 필드에 공통 상태 및 크기 규칙이 존재한다', () => {
	assert.match(declarations('label.choice-option:has(input:checked)'), /--secondary/);
	assert.match(declarations('label.choice-option:has(input:disabled)'), /not-allowed/);
	assert.match(declarations('.form-field > input'), /width: 100%/);
	assert.match(declarations('.module'), /padding: 0.8rem 1.1rem/);
});

function pageFiles(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		return entry.isDirectory() ? pageFiles(path) : entry.name === '+page.svelte' ? [path] : [];
	});
}
test('일반 페이지는 같은 부모 안에 헤더와 본문을 배치한다', () => {
	let checked = 0;
	for (const path of pageFiles('src/routes')) {
		const source = readFileSync(path, 'utf8');
		if (!/<(?:Page|Board|Review|Search|Submission)Header\b/.test(source)) continue;
		const { fragment } = parse(source, { modern: true });
		const elements = fragment.nodes.filter(
			(node) => node.type !== 'Text' && node.type !== 'Comment'
		);
		assert.equal(elements.length, 1, path);
		const [section] = elements;
		assert.equal(section.name, 'section', path);
		const classAttribute = section.attributes.find((attribute) => attribute.name === 'class');
		assert.match(classAttribute?.value?.[0]?.data ?? '', /\bpage\b/, path);
		const children = section.fragment.nodes.filter(
			(node) => node.type !== 'Text' && node.type !== 'Comment'
		);
		assert.match(children[0].name, /Header$/, path);
		checked++;
	}
	assert.ok(checked >= 20);
	assert.match(declarations('.page'), /gap: 1rem/);
});
