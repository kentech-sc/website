<script lang="ts">
	import GoogleModule from './googleModule.svelte';
</script>

<section class="container-col module">
	<h1>켄텍 이메일로 로그인 후 이용 가능합니다.</h1>
	<GoogleModule />
</section>

<style lang="scss">
	h1 {
		margin-bottom: 1rem;
	}

	section {
		width: 100%;
		height: 50vh;
	}
</style>
