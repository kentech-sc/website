<script lang="ts" context="module">
  // 타입 선언은 모듈 컨텍스트에 작성
  export interface Slide {
    title: string;
    image: string;
  }
</script>

<script lang="ts">
  export let slides: Slide[] = [];
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
    {#each slides as slide}
      <li class="slideitem">
        <div class="textbox">
          <h3>{slide.title}</h3>
        </div>
        <img src={slide.image} alt={slide.title} />
      </li>
    {/each}
  </ul>

  <!-- 좌우 버튼 -->
  <button class="control left" on:click={prev}></button>
  <button class="control right" on:click={next}></button>

  <!-- 페이징 -->
  <ul class="slide-pagelist">
    {#each slides as _, idx}
      <li>
        <button class:selected={current === idx}
          on:click={() => goTo(idx)}
        ></button>
      </li>
    {/each}
  </ul>
</div>

<style lang="scss">
    .slideshow {
        position: relative;
        width: 100vw;
        max-width: 100vw;
        margin-left: calc(-41.25vw + 50%);
        
        overflow: hidden;

        .slidelist {
            display: flex;
            transition: transform 0.5s ease-in-out;
            width: 100%;

            .slideitem {
                flex: 0 0 100%;
                position: relative;

                img {
                    width: 100%;
                    display: block;
                }

                .textbox {
                    position: absolute;
                    z-index: 1;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    line-height: 1.6;
                    text-align: center;

                    h3 {
                    font-size: 2rem;
                    color: #fff;
                    margin-bottom: 0.5rem;
                    }
                }
            }
        }

        .control {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 3rem;
            height: 3rem;
            border: none;
            background-size: cover;
            background-repeat: no-repeat;
            cursor: pointer;
            z-index: 2;

            &.left {
            left: 10px;
            background-image: url('/img/left.png');
            }
            &.right {
            right: 10px;
            background-image: url('/img/right.png');
            }
        }

        .slide-pagelist {
            position: absolute;
            top: 92%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            justify-content: center;
            margin: 1rem 0;

            li {
                margin: 0 5px;
                list-style-type: none;

                button {
                    width: 3.5rem;
                    height: 0.7rem;
                    border-radius: 1rem;
                    border: none;
                    background: #ccc;
                    

                    &.selected {
                    background: #666;
                    }
                }
            }
        }
    }
</style>
