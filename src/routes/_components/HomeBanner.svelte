<!-- 레이아웃 확정용 껍데기. 실제 홍보 이미지와 링크는 배너 작업 때 채운다. -->
<section class="banner module is-flush">
	<div class="banner-inner container-col">
		<span class="banner-label">배너</span>
		<p>다른 부서 홍보 영역</p>
	</div>
</section>

<style lang="scss">
	@use 'media';

	.banner {
		border-color: var(--tertiary);
		background: linear-gradient(100deg, var(--tertiary), var(--secondary));
		color: var(--tertiary-text);
	}

	.banner-inner {
		justify-content: center;
		gap: 0.3rem;
		padding: 1rem;
		// IAB 표준 배너는 Billboard(970x250, 3.9:1)와 Leaderboard(728x90, 8.1:1) 사이에 놓인다.
		// 홍보 이미지가 담기면서도 아래 달력/학식을 밀어내지 않도록 그 중간인 6:1 로 잡았다.
		aspect-ratio: 6 / 1;
		// 폭이 좁아져도 문구가 눌리지 않게 하한을 둔다.
		min-height: 5rem;

		@include media.mobile {
			// 모바일에서 6:1 을 유지하면 높이가 60px 밑으로 떨어져 글씨를 읽을 수 없다.
			// 비율을 키우면 이미지 좌우가 잘리므로, 잘림(약 17%)과 가독성이 균형을 이루는 4:1 로 둔다.
			// 배너 이미지는 가운데 60% 안에 핵심 내용이 오도록 받아야 한다.
			aspect-ratio: 4 / 1;
		}
	}

	.banner-label {
		opacity: 0.75;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
	}

	p {
		margin: 0;
		font-size: 1.1rem;
	}
</style>
