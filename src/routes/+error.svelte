<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const title = $derived.by(() => {
		switch (page.status) {
			case 401:
				return '로그인이 필요합니다.';
			case 403:
				return '접근할 수 없습니다.';
			case 404:
				return '페이지를 찾을 수 없습니다.';
			default:
				return '오류가 발생했습니다.';
		}
	});

	const description = $derived.by(() => {
		if (page.status >= 500) {
			return '잠시 후 다시 시도해 주세요. 문제가 계속되면 관리자에게 알려 주세요.';
		}

		const message = page.error?.message;
		if (message && message !== 'Not Found') return message;

		switch (page.status) {
			case 401:
				return '로그인한 뒤 다시 시도해 주세요.';
			case 403:
				return '이 페이지를 이용할 권한이 없습니다.';
			case 404:
				return '주소가 올바른지 확인해 주세요.';
			default:
				return '요청을 처리하지 못했습니다. 다시 시도해 주세요.';
		}
	});
</script>

<section class="container-col module">
	<h2>{title}</h2>
	<p>{description}</p>
	<p class="status-code">오류 코드 {page.status}</p>
	<a class="link-btn" href={resolve('/')}>메인 페이지로 돌아가기</a>
</section>

<style lang="scss">
	section {
		gap: 0.6rem;
		margin-top: 2rem;
		width: 100%;
		height: 50vh;
		text-align: center;
	}

	h2 {
		font-weight: 600;
		font-size: 1.2rem;
	}

	p {
		color: var(--gray);
		font-size: 0.8rem;
	}

	.status-code {
		color: var(--secondary);
	}

	a {
		margin-top: 0.6rem;
	}
</style>
