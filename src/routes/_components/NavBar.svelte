<script lang="ts">
	import favicon from '$lib/assets/kentech.ico';
	import { page } from '$app/state';
	const user = $derived(JSON.parse(page.data.user ?? '{}'));
</script>

{#snippet Nav()}
	<nav>
		<a href="/board">자유게시판</a>
		|
		<a href="/review">강의평가</a>
		|
		<a href="/petition">청원</a>
	</nav>
{/snippet}

{#snippet Profile()}
	<div class="container" id="profile">
		{#if user.group !== 'guest'}
			<a href="/profile" class="btn-anchor">
				<p>{user.nickname}</p>
			</a>
		{:else}
			<a href="/signin" class="btn-anchor">
				<p>로그인</p>
			</a>
		{/if}
	</div>
{/snippet}

{#snippet Search()}
	<div>
		<input type="text" placeholder="검색(장식임)" />
		<button>검색</button>
	</div>
{/snippet}

<header class="container module">
	<a href="/" class="container">
		<img src={favicon} alt="logo" />
	</a>
	{@render Nav()}
	{@render Profile()}
	{@render Search()}
</header>

<style lang="scss">
	header {
		margin: 0;
		padding: 0.5rem 8rem;
		justify-content: space-between;
		position: sticky;
		top: 0;

		border: none;
		border-bottom: solid var(--gray-border) 0.1rem;

		img {
			width: 1.5rem;
			margin-right: 0.25rem;
		}

		#profile {
			a {
				margin-left: 0.5rem;
			}
		}
	}
</style>
