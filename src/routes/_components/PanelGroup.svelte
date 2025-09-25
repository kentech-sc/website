{#snippet ConversationPanel()}
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

{#snippet ShortcutPanel()}
	<aside class="module" id="shortcut-panel">
		<h2>바로가기</h2>
		<hr />
		<div class="container-col">
			<a href="https://kentech.ac.kr/" target="_blank">켄텍 홈페이지</a>
			<a href="https://my.kentech.ac.kr/" target="_blank">my.kentech</a>
		</div>
	</aside>
{/snippet}

<div id="panel-group">
	{@render ConversationPanel()}
	{@render ShortcutPanel()}
</div>

<style lang="scss">
	#panel-group {
		height: stretch;
		margin-right: 1rem;

		aside {
			margin: 1rem 0;

			h2 {
				text-align: center;
			}
		}

		#shortcut-panel {
			position: sticky;
			top: 4rem;
		}
	}
</style>
