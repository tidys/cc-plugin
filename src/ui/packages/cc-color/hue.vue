<template>
  <div class="root">
    <div class="title">{{ title }}</div>
    <div class="hue" ref="hue" @mousedown.self="onHueMouseDown">
      <div class="bg"></div>
      <div class="pointer" ref="pointer">
        <div class="shape"></div>
      </div>
    </div>
  </div>


</template>

<script lang="ts">
import {defineComponent, ref} from "vue"

export default defineComponent({
  name: "hue",
  props: {
    title: {
      type: String,
      default: '颜色',
    }
  },
  setup(props, { emit }) {
    const hue = ref();
    const pointer = ref();
    const title = ref(props.title);
    return {
      hue, pointer, title,
      onHueMouseDown(event) {
        const HueEl: HTMLDivElement = hue.value as HTMLDivElement;
        const PointerEl: HTMLDivElement = pointer.value as HTMLDivElement;
        const rect = HueEl.getBoundingClientRect();
        let mouseMove = (e) => {
          let x = (e.clientX - rect.left) / rect.width * 100;
          x = x > 100 ? 100 : x;
          x = x < 0 ? 0 : x;

          PointerEl.style.left = `${x}%`;
        }
        let mouseUp = (e) => {
          document.removeEventListener('mousemove', mouseMove);
          document.removeEventListener('mouseup', mouseUp);
        }
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
        mouseMove(event);
      },
    }
  }
})
</script>

<style scoped lang="less">
div {
  user-select: none;
  -webkit-user-drag: none;
}

.root {
  display: flex;
  flex-direction: row;

  .title {
    color: #2a2a2a;
  }

  .hue {
    position: relative;
    height: 20px;
    flex: 1;

    .bg {
      width: 100%;
      height: 100%;
      pointer-events: none;
      background: linear-gradient(to right, red 0%, #ff0 17%, lime 33%, cyan 50%, blue 66%, #f0f 83%, red 100%)
    }

    .pointer {
      position: absolute;
      left: 100%;
      top: 0;
      width: 0;
      height: 100%;

      .shape {
        box-sizing: border-box;
        height: 100%;
        top: 0;
        width: 4px;
        margin-left: -2px;
        margin-right: -2px;
        border: 2px solid rgba(255, 255, 255, 0.7);
        border-radius: 1px;
      }
    }
  }

}
</style>