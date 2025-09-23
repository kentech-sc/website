<script lang="ts">
	import '$lib/style/main.css';
	import favicon from '$lib/assets/kentech.ico';
	import { page } from '$app/state';

	let { children } = $props();

	const user = $derived(JSON.parse(page.data.user ?? '{}'));
</script>

<svelte:head>
	<title>켄텍 학생회</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{#snippet ProfileModule()}
	<div class="container" id="profile-div">
		{#if user.group !== 'guest'}
			<a href="/profile" class="btn-anchor">
				<p>{user?.nickname}</p>
			</a>
		{:else}
			<a href="/signin" class="btn-anchor">
				<p>로그인</p>
			</a>
		{/if}
	</div>
{/snippet}

{#snippet SearchModule()}
	<div>
		<input type="text" placeholder="검색(장식임)" />
		<button>검색</button>
	</div>
{/snippet}

{#snippet NavBar()}
	<header class="container module">
		<a href="/" class="container" id="logo-anchor">
			<img src={favicon} alt="logo" />
		</a>
		<nav>
			<a href="/board">자유게시판</a>
			|
			<a href="/review">강의평가</a>
			|
			<a href="/petition">청원</a>
		</nav>
		{@render ProfileModule()}
		{@render SearchModule()}
	</header>
{/snippet}

{#snippet ConversationAside()}
	<aside class="module">
		<h2>회장과의 대화</h2>
		<hr />
		<button
			onclick={() => {
				prompt('그냥 장식임');
			}}>대화하기</button
		>
	</aside>
{/snippet}

{#snippet ShortcutAside()}
	<aside class="module" id="shortcut-aside">
		<h2>바로가기</h2>
		<hr />
		<div class="container-col">
			<a href="https://kentech.ac.kr/" target="_blank">켄텍 홈페이지</a>
			<a href="https://my.kentech.ac.kr/" target="_blank">my.kentech</a>
		</div>
	</aside>
{/snippet}

{#snippet Footer()}
	<footer class="module">
		<p>2025 KENTECH STUDENT COUNCIL</p>
		<p>Developed by nemovim</p>
	</footer>
{/snippet}

{@render NavBar()}
<div id="layout" class="container">
	<div id="panel-div">
		{@render ConversationAside()}
		{@render ShortcutAside()}
	</div>

	<main class="container-col">
		{@render children?.()}
	</main>
</div>
{@render Footer()}

<style lang="scss">
	header {
		padding: 0.5rem;
		justify-content: space-between;
		position: sticky;
		top: 0;

		border: none;
		border-bottom: solid var(--gray-border) 0.1rem;

		#logo-anchor {
			img {
				width: 1.5rem;
				margin-right: 0.25rem;
			}
		}

		#profile-div {
			a {
				margin-left: 0.5rem;
			}
		}
	}

	#layout {
		align-items: flex-start;

		#panel-div {
			height: stretch;

			aside {
				margin: 1rem;
				margin-right: 0;

				h2 {
					text-align: center;
				}
			}

			#shortcut-aside {
				position: sticky;
				top: 4rem;
			}
		}

		main {
			margin: 0.5rem;
			flex: 1;
			max-width: 70vw;
		}
	}

	footer {
		flex-grow: 1;
		border: none;
		border-top: solid var(--gray-border) 0.1rem;
		font-size: 0.75rem;
		color: var(--gray-text);
		background-color: var(--gray-bg);
		justify-content: space-between;
	}
</style>
