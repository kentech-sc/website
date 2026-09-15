<script lang="ts">
	import AuditArticle from '../../_components/AuditArticle.svelte';

	import CommonHeader from '$components/CommonHeader.svelte';

	let { data } = $props();
</script>

<CommonHeader title="감사원 제보" description="제보 내용과 처리 상태를 확인합니다." />
<AuditArticle report={data.report} />
