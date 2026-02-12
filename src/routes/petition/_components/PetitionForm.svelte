<script lang="ts">
    import CommonForm from '$components/CommonForm.svelte';

	import type { Post } from '$lib/types/post.type.js';

    import QuillEditor from '$components/QuillEditor.svelte';
    import type { FileMeta } from '$lib/types/file-meta.type';

    let { post, files = [] }: { post?: Post; files?: Array<FileMeta | null> } = $props();

    let editorHtml = $state('');
    let uploadedFileMetas = $state<FileMeta[]>(files.filter((file) => file !== null));
</script>

<section class="module">
    <CommonForm actionName="createPetition" formName="createPetition">
        <div id="form-div">
            
            <input 
                type="text" 
                id="title" 
                name="title" 
                placeholder="청원 제목을 입력하세요" 
            />

            <input class="hidden" type="text" name="content" bind:value={editorHtml} readonly />
            {#each uploadedFileMetas as fileMeta (fileMeta._id)}
                <input
                    class="hidden"
                    type="text"
                    name="fileMetas"
                    value={JSON.stringify(fileMeta)}
                    readonly
                />
            {/each}

            <QuillEditor bind:editorHtml bind:uploadedFileMetas initialHtml={post?.content} />

            <div class="right-align">
                <button type="submit" class="btn-action">청원하기</button>
            </div>
        </div>
    </CommonForm>
</section>

<style lang="scss">
    #title {
        font-size: 1rem;
    }

    #form-div {
        width: 100%;
        align-items: flex-start;

        input {
            width: 100%;
            margin-bottom: 0.5rem;
        }

        .hidden {
            display: none;
        }
    }
</style>