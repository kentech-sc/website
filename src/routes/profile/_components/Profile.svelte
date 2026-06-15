<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import LogOut from '@lucide/svelte/icons/log-out';
	import UserIcon from '@lucide/svelte/icons/user';

	import type { User } from '$lib/types/user.type.js';

	let { user }: { user: User } = $props();
	let logoutLoading = $state(false);

	async function handleSignOut() {
		if (logoutLoading) return;

		logoutLoading = true;

		try {
			await signOut();
		} finally {
			logoutLoading = false;
		}
	}
</script>

<section class="profile-card container-col">
	<div class="profile-header">
		<div class="avatar container">
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

	<button
		class="error-btn logout-btn"
		disabled={logoutLoading}
		aria-busy={logoutLoading ? 'true' : 'false'}
		onclick={handleSignOut}
	>
		<LogOut size="0.8rem" />
		<span>로그아웃</span>
	</button>
</section>

<style lang="scss">
	.profile-card {
		gap: 1rem;

		& > * {
			width: stretch;
		}
	}

	.profile-header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		border-bottom: 0.1rem solid var(--gray-border);
		padding-bottom: 0.6rem;

		.avatar {
			border-radius: 50%;
			background: var(--secondary);
			width: 2.4rem;
			height: 2.4rem;
			color: var(--tertiary-text);
		}

		.profile-info {
			h2 {
				color: var(--text);
				font-weight: 600;
				font-size: 1rem;
			}

			.user-id {
				color: var(--gray-text);
				font-size: 0.7rem;
			}
		}
	}

	.profile-details {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;

		.detail-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-radius: 0.4rem;
			background: var(--gray-bg);
			padding: 0.4rem 0.6rem;

			.label {
				color: var(--gray-text);
				font-size: 0.7rem;
			}

			.value {
				color: var(--text);
				font-weight: 500;
				font-size: 0.8rem;

				&.badge {
					border-radius: 0.4rem;
					background: var(--secondary-bg);
					padding: 0.2rem 0.4rem;
					color: var(--tertiary);
					font-size: 0.7rem;
					text-transform: uppercase;
				}
			}
		}
	}
</style>
