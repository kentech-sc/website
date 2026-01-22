<script lang="ts">
	let { pageType } = $props();
	
	import LinkButton from '$components/common/LinkButton.svelte'

	import Pen from '@lucide/svelte/icons/pencil';
    import List from '@lucide/svelte/icons/text';
</script>

<header class="container-col module_head">
    <h1>청원</h1>
	<div class="container">
		<p>더 나은 학교를 위해 소중한 의견을 제안해 주세요</p>
        {#if pageType === 'list'}
            <LinkButton href="/petition/new">
                <Pen size="1rem" />
                <span>청원하기</span>
            </LinkButton>
            
        {:else if pageType === 'new' || pageType === 'detail'}
            <LinkButton href="/petition">
                <List size="1rem" />
                <span>목록</span>
            </LinkButton>
        {/if}
    </div>
    <hr />
</header>

<style lang="scss">
	 header {
        align-items: flex-start;
        width: stretch;

        .container {
            width: stretch;
            justify-content: space-between;
            align-items: center;
        }
    }

    p {
        font-size: 0.9rem;
        font-weight: bold;
        margin: 0;
    }

</style>
