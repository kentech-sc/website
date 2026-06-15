import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default ts.config(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		// 🌟 전역 플러그인 등록 (프로젝트 전체에서 import-x 규칙을 사용할 수 있게 만듭니다.)
		plugins: {
			'import-x': importX
		},
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			'no-undef': 'off',

			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],

			// 🌟 프로젝트 전체 파일(TS, JS, Svelte 포함)에 적용될 Import 정렬 규칙
			'import-x/order': [
				'error',
				{
					groups: [
						'builtin', // Node 내장 모듈
						'external', // npm 패키지
						'internal', // 내부 절대경로 aliases
						['parent', 'sibling'], // 부모, 형제 파일
						'index', // index.ts
						'object',
						'type' // 타입 import 분리
					],
					'newlines-between': 'always', // 그룹 간 빈 줄 강제
					alphabetize: {
						order: 'asc',
						caseInsensitive: true
					}
				}
			]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	}
);
