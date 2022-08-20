<template>
  <div class="root">
    <div class="hue" ref="hueEl" @mousedown.self="onHueMouseDown">
      <div class="bg"></div>
      <div class="pointer" ref="pointer">
        <div class="shape"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref, watch} from 'vue';
import {getColorHue, transformColorByHue} from './util';
// 色相
export default defineComponent({
  name: 'color-hue',
  emits: ['change', 'update:hue'],
  props: {
    title: {
      type: String,
      default: '颜色',
    },
    hue: {
      type: Number,
      default: 0,
    },
  },
  setup(props, { emit }) {
    const hueEl = ref();
    const pointer = ref();
    watch(() => props.hue, (hue: number) => {
      updatePointer(hue);
    });

    function updatePointer(hue: number) {
      const PointerEl: HTMLDivElement = pointer.value as HTMLDivElement;
      PointerEl.style.left = `${hue / 360 * 100}%`;
    }

    onMounted(() => {
      updatePointer(props.hue);
    });
    return {
      hueEl, pointer,
      onHueMouseDown(event: MouseEvent) {
        const PointerEl: HTMLDivElement = pointer.value as HTMLDivElement;
        const rect = (hueEl.value as HTMLDivElement).getBoundingClientRect();
        const mouseMove = (e: MouseEvent) => {
          let x = (e.clientX - rect.left) / rect.width * 100;
          x = x > 100 ? 100 : x;
          x = x < 0 ? 0 : x;

          PointerEl.style.left = `${x}%`;
          const hue = 360 * (x / 100);
          emit('update:hue', hue);
          emit('change', hue);
        };
        let mouseUp = (e: MouseEvent) => {
          document.removeEventListener('mousemove', mouseMove);
          document.removeEventListener('mouseup', mouseUp);
        };
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
        mouseMove(event);
      },
    };
  },
});
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
    overflow: hidden;
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
        pointer-events: none;
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