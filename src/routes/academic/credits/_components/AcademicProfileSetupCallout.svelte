<script lang="ts">
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
</script>

<section class="module profile-setup-callout">
	<GraduationCap size="1.5rem" />
	<div>
		<h2>먼저 학사 기준을 설정해 주세요</h2>
		<p>입학연도와 ESP 면제 교과목을 저장하면 졸업요건을 계산합니다.</p>
	</div>
</section>

<style lang="scss">
	.profile-setup-callout {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.8rem;
		padding: 1.4rem;
	}
	.profile-setup-callout :global(svg) {
		color: var(--secondary);
	}
	.profile-setup-callout h2,
	.profile-setup-callout p {
		margin: 0;
	}
	.profile-setup-callout h2 {
		font-size: 1rem;
	}
	.profile-setup-callout p {
		color: var(--gray-text);
		font-size: 0.8rem;
	}
</style>
