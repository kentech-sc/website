<script lang="ts">
	import '$lib/style/main.css';
	import favicon from '$lib/assets/favicon.svg';
	import { signOut } from '@auth/sveltekit/client';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="container module">
	<img src="" alt="logo" />
	<nav>
		<a href="/">Home</a>
		|
		<a href="/board">자유게시판</a>
		|
		<a href="/review">강의평가</a>
	</nav>
	<div>
		<input type="text" placeholder="검색" />
		<button>Search</button>
	</div>
</header>

<div id="layout" class="container">
	<div id="panel-div">
		<aside class="module">
			<h2>회장과의 대화</h2>
		</aside>
		<aside class="module">
			<h2>프로필</h2>
			<button onclick={() => signOut()}>Sign out</button>
		</aside>
		<aside class="module" id="shortcut-aside">
			<h2>바로가기</h2>
		</aside>
	</div>

	<main class="container-col">
		{@render children?.()}
	</main>
</div>

<footer class="container module">
	<p>Footer</p>
</footer>

<style lang="scss">

	#layout {
		align-items: flex-start;
	}

	#panel-div {
		height: stretch;
	}

	#shortcut-aside {
		position: sticky;
		top: 4rem;
	}

	aside {
		margin: 1rem;
	}

	header{
		padding: .5rem;
		justify-content: space-between;
		position: sticky;
		top: 0;
	}

	// footer {
	// 	margin-top: .5rem;
	// }

	main {
		margin: .5rem;
		flex: 1;
		max-width: 70vw;
	}
</style>
