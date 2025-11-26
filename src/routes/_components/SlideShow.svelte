<script lang="ts">
	import slide01 from '$assets/slide01.jpg';
	import slide02 from '$assets/slide02.jpg';
	import slide03 from '$assets/slide03.jpg';
	import leftImg from '$assets/left.png';
	import rightImg from '$assets/right.png';

	const slides = [
		{ title: '~풍경 사진~', image: slide01 },
		{ title: '~수업 사진~', image: slide02 },
		{ title: '~회장 사진~', image: slide03 }
	];

	let current = 0;

	function prev() {
		current = (current - 1 + slides.length) % slides.length;
	}
	function next() {
		current = (current + 1) % slides.length;
	}
	function goTo(idx: number) {
		current = idx;
	}
</script>

<div class="slideshow">
	<ul class="slidelist" style="transform: translateX(-{current * 100}%);">
		{#each slides as slide, idx (idx)}
			<li class="slideitem">
				<p>{slide.title}</p>
				<img src={slide.image} alt={slide.title} />
			</li>
		{/each}
	</ul>

	<!-- 좌우 버튼 -->
	<button class="control container" id="left-btn" onclick={prev}
		><img src={leftImg} alt="left" /></button
	>
	<button class="control container" id="right-btn" onclick={next}
		><img src={rightImg} alt="right" /></button
	>

	<!-- 페이징 -->
	<ul id="slide-pagelist" class="container">
		{#each slides as _, idx (idx)}
			<li>
				<button class:selected={current === idx} onclick={() => goTo(idx)} aria-label="slide {idx}"
				></button>
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	.slideshow {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;

		.slidelist {
			display: flex;
			transition: transform 0.5s ease-in-out;
			list-style-type: none;

			.slideitem {
				flex: 0 0 100%;
				position: relative;

				img {
					width: 100%;
					display: block;
				}

				p {
					position: absolute;
					font-weight: bold;
					z-index: 2;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					text-align: center;
					font-size: 2.5rem;
					color: white;
				}
			}
		}

		.control {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			width: 6rem;
			height: 100%;
			border: none;
			background-color: transparent;
			z-index: 2;
			padding: 0 1rem;

			img {
				width: 100%;
			}

			&:hover {
				opacity: 0.6;
				background-color: oklch(0 0 0 / 20%);
			}

			&:focus {
				outline: none;
			}
		}

		#left-btn {
			left: 0;
			padding-right: 1.4rem;
		}

		#right-btn {
			right: 0;
			padding-left: 1.4rem;
		}

		#slide-pagelist {
			position: absolute;
			bottom: 0%;
			left: 50%;

			transform: translate(-50%, -50%);

			margin: 1rem 0;

			li {
				margin: 0 0.2rem;
				list-style-type: none;

				button {
					width: 2.2rem;
					height: 0.5rem;

					border-radius: 1rem;
					border: none;
					background: var(--gray-bg);

					&:hover {
						background: var(--gray-hover);
					}

					&:focus {
						outline: none;
					}

					&.selected {
						background: var(--gray);
					}
				}
			}
		}
	}
</style>
