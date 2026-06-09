<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import LogOut from '@lucide/svelte/icons/log-out';
	import UserIcon from '@lucide/svelte/icons/user';
	import type { User } from '$lib/types/user.type.js';

	let { user }: { user: User } = $props();
</script>

<section class="profile-card">
	<div class="profile-header">
		<div class="avatar">
			<UserIcon size="2rem" />
		</div>
		<div class="profile-info">
			<h2>{user.realName}</h2>
			<p class="user-id">@{user.nickname}</p>
		</div>
	</div>

	<div class="profile-details">
		<div class="detail-item">
			<span class="label">이메일</span>
			<span class="value">{user.email}</span>
		</div>

		<div class="detail-item">
			<span class="label">별명</span>
			<span class="value">{user.nickname}</span>
		</div>

		<div class="detail-item">
			<span class="label">권한</span>
			<span class="value badge">{user.group}</span>
		</div>

		<div class="detail-item">
			<span class="label">포인트</span>
			<span class="value">{user.points}점</span>
		</div>
	</div>

	<div class="profile-actions">
		<button class="error-btn logout-btn" onclick={() => signOut()}>
			<LogOut size="1rem" />
			<span>로그아웃</span>
		</button>
	</div>
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
				font-size: 1.2rem;
				font-weight: 600;
				color: var(--text);
			}

			.user-id {
				margin: 0;
				font-size: 0.8rem;
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
				font-size: 0.8rem;
				color: var(--gray-text);
				font-weight: 500;
			}

			.value {
				font-size: 1rem;
				color: var(--text);
				font-weight: 500;

				&.badge {
					background: var(--secondary-bg);
					color: var(--secondary);
					padding: 0.25rem 0.5rem;
					border-radius: 0.25rem;
					font-size: 0.8rem;
					text-transform: uppercase;
				}
			}
		}
	}

	.profile-actions {
		.logout-btn {
			width: 100%;
		}
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
