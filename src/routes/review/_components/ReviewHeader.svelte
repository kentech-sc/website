<script lang="ts">
    import Pen from '@lucide/svelte/icons/pencil';
    import List from '@lucide/svelte/icons/text';
    import Plus from '@lucide/svelte/icons/plus'; 

    import LinkButton from '$components/common/LinkButton.svelte';

    let { pageType } = $props();
</script>

<header class="container-col module_head">
    <h1>강의 평가</h1>

    <div class="container">
        <p>수강했던 강의에 대한 솔직한 후기를 남겨주세요</p>
        
        {#if pageType === 'list'}
            <div class="btn-group">
                <LinkButton href="/course/new">
                    <Plus size="1rem" />
                    <span>강의/교수 추가</span>
                </LinkButton>
                <LinkButton href="/review/new">
                    <Pen size="1rem" />
                    <span>평가하기</span>
                </LinkButton>
            </div>

        {:else if pageType === 'new' || pageType === 'edit' || pageType === 'detail'}
            <LinkButton href="/review">
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
	
    .btn-group {
        display: flex;
        gap: 0.5rem;
    }
</style>