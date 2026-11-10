<script lang="ts">
	import List from '@lucide/svelte/icons/text';

	import MeetupForm from '../_components/MeetupForm.svelte';

	import { resolve } from '$app/paths';
	import PageHeader from '$components/PageHeader.svelte';
</script>

<section class="page">
	<PageHeader title="일정 만들기" description="후보 날짜와 시간 범위를 정하세요.">
		<a href={resolve('/life/meetups')} class="ui-button is-primary">
			<List size="0.8rem" />
			<span>목록</span>
		</a>
	</PageHeader>
	<MeetupForm />
</section>
