<script lang="ts">
	import '$lib/style/main.css';
	import favicon from '$lib/assets/kentech.ico';
	import { signOut } from '@auth/sveltekit/client';
	import { page } from '$app/state';

	let { children } = $props();

	const user = $derived(JSON.parse(page.data.user ?? '{}'));
</script>

<svelte:head>
	<title>켄텍 학생회</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="container module">
	<img src={favicon} alt="logo" />
	<nav>
		<a href="/">Home</a>
		|
		<a href="/board">자유게시판</a>
		|
		<a href="/review">강의평가</a>
		|
		<a href="/petition">청원</a>
	</nav>
	<div>
		<input type="text" placeholder="검색(장식임)" />
		<button>검색</button>
	</div>
</header>

<div id="layout" class="container">
	<div id="panel-div">
		<aside class="module">
			<h2>회장과의 대화</h2>
		</aside>
		<aside class="module">
			<h2>프로필</h2>
			{#if user?.email}
				<hr />
				<h3>이메일</h3>
				<p>{user.email}</p>
				<hr />
				<h3>실명</h3>
				<p>{user.realName}</p>
				<hr />
				<h3>별명</h3>
				<p>{user.nickname}</p>
				<hr />
				<button onclick={() => signOut()}>로그아웃</button>
			{/if}
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

	img {
		width: 1.5rem;
	}

	header {
		padding: 0.5rem;
		justify-content: space-between;
		position: sticky;
		top: 0;
	}

	// footer {
	// 	margin-top: .5rem;
	// }

	main {
		margin: 0.5rem;
		flex: 1;
		max-width: 70vw;
	}
</style>
