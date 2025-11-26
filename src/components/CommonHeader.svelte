<script lang="ts">
	let { title, link, linkText }: { title: string; link?: string; linkText?: string } = $props();
</script>

<header class="container module">
	<h1>{title}</h1>
	{#if link}
		<a href={link}>{linkText}</a>
	{/if}
</header>
