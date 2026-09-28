<script lang="ts">
	import type { Review } from '$lib/types/review.type.js';

	import { resolve } from '$app/paths';
	import { formatRelativeDate } from '$lib/shared/utils.js';
	import { TERM_LABELS } from '$lib/shared/view.js';

	let { review }: { review: Review } = $props();
</script>

<a
	href={resolve('/academic/reviews/[reviewId]', { reviewId: review.id })}
	class="content-list-item"
>
	<header><strong>{review.title}</strong></header>
	<footer>
		<span>
			{review.professors.length
				? `${review.professors.map((professor) => professor.name).join(', ')} 교수`
				: '담당 교수 개별 배정'}
			· {review.courseName} · {review.year}년 {TERM_LABELS[review.term]}학기 · 만족도
			{review.score.satisfaction}/10
		</span>
		<time datetime={review.createdAt}>{formatRelativeDate(review.createdAt)}</time>
	</footer>
</a>
