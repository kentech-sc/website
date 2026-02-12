<script lang="ts">
	import CommonForm from '$components/CommonForm.svelte';

	import type { ActionResult } from '@sveltejs/kit';

	let formResult = $state<ActionResult | null>(null);
	let courseCodeInput = $state<HTMLInputElement | null>(null);
	let courseNameInput = $state<HTMLInputElement | null>(null);
	let courseContentInput = $state<HTMLTextAreaElement | null>(null);
	$effect(() => {
		if (formResult?.type === 'success') {
			if (courseCodeInput) {
				courseCodeInput.value = '';
			}
			if (courseNameInput) {
				courseNameInput.value = '';
			}
			if (courseContentInput) {
				courseContentInput.value = '';
			}
		}
	});
</script>

<section class="container-col module">
	<CommonForm actionName="addCourse" formName="addCourse" bind:formResult>
		<div class="container-col">
			<label for="code">강의 코드</label>
			<input type="text" id="code" name="code" placeholder="예: EF1001" bind:this={courseCodeInput} />
			<label for="name">강의명</label>
			<input type="text" id="name" name="name" placeholder="예: 공학 미적분학 I" bind:this={courseNameInput} />
			<label for="content">강의 내용</label>
			<textarea id="content" name="content" placeholder="강의에 대한 간략한 설명을 입력하세요" bind:this={courseContentInput}></textarea>
			<div class="right-align">
				<button type="submit" class="btn-action">추가하기</button>
			</div>
		</div>
	</CommonForm>
	{#if formResult?.type === 'success'}
		<p>✅ 강의가 추가되었습니다.</p>
	{/if}
</section>

<style lang="scss">
	div {
		align-items: flex-start;

		label {
        	font-weight: bold;
        	margin-bottom: 0.5rem;
    	}

		input,
		textarea {
			width: stretch;
			margin-bottom: 0.5rem;
		}

		textarea {
			height: 50vh;
			resize: vertical;
		}

		.right-align {
			margin-top: 0rem;
		}
		
		.btn-action {
			padding: 0.4rem 1.2rem;
			font-size: 0.9rem;
		}
	}
</style>
