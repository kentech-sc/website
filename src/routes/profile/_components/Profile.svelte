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
			<UserIcon size="1.6rem" />
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
			<LogOut size="0.8rem" />
			<span>로그아웃</span>
		</button>
	</div>
</section>

<style lang="scss">
	.profile-card {
		background: var(--surface-elevated);
		border: 0.1rem solid var(--gray-border);
		border-radius: 0.4rem;
		padding: 1.2rem;
		box-shadow: 0 0.1rem 0.3rem var(--shadow-color);
	}

	.profile-header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 1.2rem;
		padding-bottom: 0.6rem;
		border-bottom: 0.1rem solid var(--gray-border);

		.avatar {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 2.4rem;
			height: 2.4rem;
			background: var(--secondary);
			border-radius: 50%;
			color: var(--tertiary-text);
		}

		.profile-info {
			flex: 1;

			h2 {
				margin: 0 0 0.2rem;
				font-size: 1rem;
				font-weight: 600;
				color: var(--text);
			}

			.user-id {
				margin: 0;
				font-size: 0.7rem;
				color: var(--gray-text);
				font-family: monospace;
			}
		}
	}

	.profile-details {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-bottom: 1.4rem;

		.detail-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0.4rem;
			background: var(--gray-bg);
			border-radius: 0.4rem;

			.label {
				font-size: 0.7rem;
				color: var(--gray-text);
				font-weight: 500;
			}

			.value {
				font-size: 0.8rem;
				color: var(--text);
				font-weight: 500;

				&.badge {
					background: var(--secondary-bg);
					color: var(--secondary);
					padding: 0.2rem 0.4rem;
					border-radius: 0.2rem;
					font-size: 0.7rem;
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
			padding: 0.6rem;
		}

		.profile-header {
			.avatar {
				width: 2rem;
				height: 2rem;
			}

			h2 {
				font-size: 0.9rem;
			}
		}
	}
</style>
