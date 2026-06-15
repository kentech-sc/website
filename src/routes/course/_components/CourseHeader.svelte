<script>
	import List from '@lucide/svelte/icons/list';

	import CommonHeader from '$components/CommonHeader.svelte';

	const title = '강의/교수 추가';
	const description = '추가하고 싶은 강의와 교수의 정보를 정확하게 입력해 주세요';
</script>

<CommonHeader {title} {description}>
	<a href="/review" class="link-btn">
		<List size="0.8rem" />
		<span>목록</span>
	</a>
</CommonHeader>
