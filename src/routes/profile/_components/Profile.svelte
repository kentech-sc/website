<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import LogOut from '@lucide/svelte/icons/log-out';
	import User from '@lucide/svelte/icons/user';

	let { user } = $props();
</script>

<section class="profile-card">
	<div class="profile-header">
		<div class="avatar">
			<User size="2rem" />
		</div>
		<div class="profile-info">
			<h2>{user?.realName || '사용자'}</h2>
			<p class="user-id">@{user?.email?.split('@')[0]}</p>
		</div>
	</div>

	<div class="profile-details">
		<div class="detail-item">
			<span class="label">이메일</span>
			<span class="value">{user?.email}</span>
		</div>

		<div class="detail-item">
			<span class="label">별명</span>
			<span class="value">{user?.nickname}</span>
		</div>

		<div class="detail-item">
			<span class="label">권한</span>
			<span class="value badge">{user?.group}</span>
		</div>
	</div>

	<div class="profile-actions">
		<button class="logout-btn" onclick={() => signOut()}>
			<LogOut size="1rem" />
			<span>로그아웃</span>
		</button>
	</div>

	{#if !user}
		<div class="login-required">
			<p>로그인이 필요합니다.</p>
		</div>
	{/if}
</section>

<style lang="scss">
	.profile-card {
		background: var(--surface-elevated);
		border: 0.1rem solid var(--gray-border);
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 0.1rem 0.3rem var(--shadow-color);
	}

	.profile-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 0.1rem solid var(--gray-border);

		.avatar {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 3rem;
			height: 3rem;
			background: var(--secondary);
			border-radius: 50%;
			color: var(--tertiary-text);
		}

		.profile-info {
			flex: 1;

			h2 {
				margin: 0 0 0.25rem;
				font-size: 1.25rem;
				font-weight: 600;
				color: var(--text);
			}

			.user-id {
				margin: 0;
				font-size: 0.875rem;
				color: var(--gray-text);
				font-family: monospace;
			}
		}
	}

	.profile-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.5rem;

		.detail-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0.5rem;
			background: var(--gray-bg);
			border-radius: 0.4rem;

			.label {
				font-size: 0.875rem;
				color: var(--gray-text);
				font-weight: 500;
			}

			.value {
				font-size: 0.875rem;
				color: var(--text);
				font-weight: 500;

				&.badge {
					background: var(--secondary-bg);
					color: var(--secondary);
					padding: 0.25rem 0.5rem;
					border-radius: 0.25rem;
					font-size: 0.75rem;
					text-transform: uppercase;
				}
			}
		}
	}

	.profile-actions {
		.logout-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			width: 100%;
			padding: 0.625rem 1rem;
			background: var(--error);
			color: var(--tertiary-text);
			border: none;
			border-radius: 0.4rem;
			font-size: 0.875rem;
			font-weight: 500;
			cursor: pointer;

			&:hover {
				background: var(--error-strong-hover);
			}
		}
	}

	.login-required {
		text-align: center;
		padding: 2rem;
		color: var(--gray-text);
		font-style: italic;
	}

	@media (max-width: 768px) {
		.profile-card {
			padding: 1rem;
		}

		.profile-header {
			.avatar {
				width: 2.5rem;
				height: 2.5rem;
			}

			h2 {
				font-size: 1.125rem;
			}
		}
	}
</style>
