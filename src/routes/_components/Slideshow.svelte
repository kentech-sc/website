<script lang="ts">
	import { onMount } from 'svelte';

	import mainLogo from '$assets/slideshow/4th_sc_logo.webp';
	import leftImg from '$assets/slideshow/left.webp';
	import rightImg from '$assets/slideshow/right.webp';
	import slide01 from '$assets/slideshow/slide01.webp';
	import slide02 from '$assets/slideshow/slide02.webp';
	import slide03 from '$assets/slideshow/slide03.webp';

	const slides = [
		{ title: '~조감도 사진~', image: slide01 },
		{ title: '~학생회 사진~', image: slide02 },
		{ title: '~야경 사진~', image: slide03 }
	];

	let current = $state(0);
	let timer: ReturnType<typeof setInterval>;

	function startTimer() {
		timer = setInterval(() => {
			current = (current + 1) % slides.length;
		}, 5000);
	}

	function resetTimer() {
		clearInterval(timer);
		startTimer();
	}

	function prev() {
		current = (current - 1 + slides.length) % slides.length;
		resetTimer();
	}
	function next() {
		current = (current + 1) % slides.length;
		resetTimer();
	}
	function goTo(idx: number) {
		current = idx;
		resetTimer();
	}

	onMount(() => {
		startTimer();
		return () => clearInterval(timer);
	});
</script>

<div class="slideshow">
	<img src={mainLogo} alt="Main Logo" class="center-logo" />

	<ul class="slidelist" style="transform: translateX(-{current * 100}%);">
		{#each slides as slide, idx (idx)}
			<li class="slideitem">
				<img src={slide.image} alt={slide.title} />
			</li>
		{/each}
	</ul>

	<button class="control container" id="left-btn" onclick={prev}
		><img src={leftImg} alt="left" /></button
	>
	<button class="control container" id="right-btn" onclick={next}
		><img src={rightImg} alt="right" /></button
	>

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

		.center-logo {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			z-index: 3;

			width: 8rem;

			filter: brightness(0) invert(1);
		}

		.slidelist {
			display: flex;
			height: 100%;
			transition: transform 0.5s ease-in-out;
			list-style-type: none;

			.slideitem {
				flex: 0 0 100%;
				position: relative;

				img {
					width: 100%;
					height: 100%;
					display: block;
					object-fit: cover;
				}
			}
		}

		.control {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			width: 5rem;
			height: 100%;
			border: none;
			background-color: transparent;
			z-index: 2;
			padding: 0 0.6rem;

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
			padding-right: 1rem;
		}

		#right-btn {
			right: 0;
			padding-left: 1rem;
		}

		#slide-pagelist {
			position: absolute;
			bottom: 0%;
			left: 50%;

			transform: translate(-50%, -50%);

			margin: 0.6rem 0;

			li {
				margin: 0 0.2rem;
				list-style-type: none;

				button {
					width: 1.8rem;
					height: 0.4rem;

					border-radius: 0.9rem;
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
