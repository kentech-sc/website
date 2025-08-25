<script lang="ts">
</script>

<div class="module" id="banner-div">
	<p>(대충 배너)</p>
</div>

<div class="module" id="calendar-div">
	<p>(대충 달력)</p>
</div>

<div class="module" id="photo-div">
	<p>(대충 사진)</p>
</div>

<div id="layout">
	<section class="module">
		<h2>공지사항</h2>
		<p>작성된 공지사항이 없습니다.</p>
	</section>
	<section class="module">
		<h2>청원</h2>
		<p>작성된 글이 없습니다.</p>
	</section>
	<section class="module">
		<h2>자유게시판</h2>
		<p>작성된 글이 없습니다.</p>
	</section>
	<section class="module">
		<h2>강의평가</h2>
		<p>작성된 리뷰가 없습니다.</p>
	</section>
</div>

<style lang="scss">
	div {
		margin: 0.5rem;
	}

	#banner-div {
		width: 100%;
	}

	#calendar-div {
		width: 100%;
	}

	#photo-div {
		width: 100%;
	}

	#layout {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	section {
		display: flex;
		flex-direction: column;
	}
</style>
