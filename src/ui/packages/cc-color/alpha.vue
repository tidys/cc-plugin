<template>
  <div class="root">
    <div class="title">{{ curTitle }}</div>
    <div class="hue" ref="hue" @mousedown.self="onHueMouseDown">
      <AlphaBoard class="alpha"></AlphaBoard>
      <div class="bg" :style="style"></div>
      <div class="pointer" ref="pointer">
        <div class="shape"></div>
      </div>
    </div>
  </div>


</template>

<script lang="ts">
import {computed, defineComponent, ref, watch} from 'vue';
import AlphaBoard from './alpha-board.vue';
import {getColorHex, transformColorWithAlpha} from '@/rich-text-editor/color/util';

export default defineComponent({
  name: 'color-alpha',
  components: { AlphaBoard },
  emits: ['change', 'update:color'],
  props: {
    title: {
      type: String,
      default: '颜色',
    },
    color: {
      type: String,
      default: 'red',
    },
  },
  setup(props, { emit }) {
    const hue = ref();
    const pointer = ref();
    const curTitle = ref(props.title);

    const style = computed(()=>{
      let color =  getColorHex(props.color);
      return `background: linear-gradient(to right, transparent 0%, ${color} 100%)`;
    });
    return {
      style,
      hue, pointer, curTitle,
      onHueMouseDown(event: MouseEvent) {
        const HueEl: HTMLDivElement = hue.value as HTMLDivElement;
        const PointerEl: HTMLDivElement = pointer.value as HTMLDivElement;
        const rect = HueEl.getBoundingClientRect();
        let mouseMove = (e: MouseEvent) => {
          let x = (e.clientX - rect.left) / rect.width * 100;
          x = x > 100 ? 100 : x;
          x = x < 0 ? 0 : x;

          PointerEl.style.left = `${x}%`;
          const color =  transformColorWithAlpha(props.color, x / 100);
          emit('update:color', color);
          emit('change', color);
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

    .alpha {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .bg {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .pointer {
      position: absolute;
      left: 50%;
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