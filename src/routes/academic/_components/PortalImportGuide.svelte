<script lang="ts">
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import ExternalLink from '@lucide/svelte/icons/external-link';

	let {
		bookmarkletHref,
		scriptCopied,
		onCopyScript
	}: {
		bookmarkletHref: string;
		scriptCopied: boolean;
		onCopyScript: () => void | Promise<void>;
	} = $props();
</script>

<ol class="portal-import-steps">
	<li>
		<div class="step-content">
			<b>추출 스크립트 준비</b>
			<div class="extractor-options">
				<div class="extractor-option">
					<p>아래 버튼을 <b>북마크 바</b>로 드래그해 추가합니다.</p>
					<!-- eslint-disable svelte/no-navigation-without-resolve -- javascript: bookmarklet href -->
					<a
						class="extractor-button"
						href={bookmarkletHref}
						onclick={(event) => event.preventDefault()}><Bookmark size="1rem" />KIS 이수내역 추출</a
					>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</div>
				<div class="extractor-option">
					<p>또는 필요한 스크립트를 복사합니다.</p>
					<button class="extractor-button" type="button" onclick={onCopyScript}
						>{#if scriptCopied}<Check size="1rem" />복사됨{:else}<Copy size="1rem" />스크립트 복사{/if}</button
					>
				</div>
			</div>
		</div>
	</li>
	<li>
		<div class="step-content">
			<b>전체성적조회 열기</b>
			<p>
				<a href="https://kis.kentech.ac.kr/main.do" target="_blank" rel="noreferrer"
					>KIS 열기 <ExternalLink size="0.7rem" /></a
				> 후 학사서비스의 전체성적조회로 이동합니다.
			</p>
		</div>
	</li>
	<li>
		<div class="step-content">
			<b>실행</b>
			<p>북마크를 누르거나 개발자 도구 Console에 스크립트를 붙여넣고 실행합니다.</p>
			<small
				>브라우저가 붙여넣기를 막으면 안내에 따라 "allow pasting"을 입력한 뒤 다시 시도하세요.</small
			>
		</div>
	</li>
</ol>

<style lang="scss">
	.portal-import-steps {
		display: grid;
		gap: 0.8rem;
		counter-reset: step;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.portal-import-steps > li {
		display: grid;
		position: relative;
		grid-template-columns: 1.6rem minmax(0, 1fr);
		gap: 0.6rem;
	}
	.portal-import-steps > li::before {
		display: grid;
		place-items: center;
		z-index: 1;
		counter-increment: step;
		border-radius: 50%;
		background: var(--secondary);
		width: 1.6rem;
		height: 1.6rem;
		content: counter(step);
		color: var(--white);
		font-weight: 700;
		font-size: 0.7rem;
	}
	.portal-import-steps > li:not(:last-child)::after {
		position: absolute;
		top: 1.6rem;
		bottom: -0.8rem;
		left: 0.8rem;
		border-left: var(--divider-border-width) solid var(--gray-border);
		content: '';
	}
	.step-content > b {
		font-size: 0.8rem;
	}
	.step-content p {
		margin: 0.2rem 0;
		color: var(--gray-text);
		font-size: 0.7rem;
	}
	.step-content a {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		color: var(--secondary);
	}
	.step-content small {
		color: var(--gray-text);
		font-size: 0.6rem;
	}
	.extractor-options {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.8rem;
		margin-top: 0.4rem;
	}
	.extractor-option {
		min-width: 0;
	}
	.extractor-button {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		cursor: pointer;
		border: var(--control-border-width) solid var(--gray-border);
		border-radius: 0.4rem;
		background: var(--white);
		padding: 0.4rem 0.6rem;
		color: var(--secondary);
		font-weight: 700;
		font-size: 0.7rem;
		text-decoration: none;
	}
	.extractor-button:hover {
		border-color: var(--secondary);
		background: var(--secondary-bg);
		text-decoration: none;
	}
	@media (max-width: 680px) {
		.extractor-options {
			grid-template-columns: 1fr;
		}
	}
</style>
