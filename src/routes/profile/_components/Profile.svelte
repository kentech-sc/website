<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import User from '@lucide/svelte/icons/user';
	import LogOut from '@lucide/svelte/icons/log-out';

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
			<p>로그인이 필요합니다</p>
		</div>
	{/if}
</section>

<style lang="scss">
	.profile-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.profile-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;

		.avatar {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 3rem;
			height: 3rem;
			background: #3b82f6;
			border-radius: 50%;
			color: white;
		}

		.profile-info {
			flex: 1;

			h2 {
				margin: 0 0 0.25rem 0;
				font-size: 1.25rem;
				font-weight: 600;
				color: #1f2937;
			}

			.user-id {
				margin: 0;
				font-size: 0.875rem;
				color: #6b7280;
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
			background: #f9fafb;
			border-radius: 0.375rem;

			.label {
				font-size: 0.875rem;
				color: #6b7280;
				font-weight: 500;
			}

			.value {
				font-size: 0.875rem;
				color: #1f2937;
				font-weight: 500;

				&.badge {
					background: #dbeafe;
					color: #1e40af;
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
			background: #ef4444;
			color: white;
			border: none;
			border-radius: 0.375rem;
			font-size: 0.875rem;
			font-weight: 500;
			cursor: pointer;

			&:hover {
				background: #dc2626;
			}
		}
	}

	.login-required {
		text-align: center;
		padding: 2rem;
		color: #6b7280;
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
