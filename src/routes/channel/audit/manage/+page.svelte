<script lang="ts">
	import AuditList from '../_components/AuditList.svelte';

	import CommonHeader from '$components/CommonHeader.svelte';

	let { data } = $props();
</script>

<CommonHeader title="감사원 제보함" description="감사원 권한이 있는 사용자만 볼 수 있습니다." />
<AuditList reports={data.reports} />
