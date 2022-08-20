<template>
  <div class="picker" draggable="false" ref="picker"
       :style="{background:bgColor}"
       @mousedown.self="onPickerPointerMouseDown">
    <div class="white" draggable="false"></div>
    <div class="black" draggable="false"></div>
    <div class="pointer" ref="pointer" draggable="false">
      <div class="shape1" draggable="false"></div>
      <div class="shape2" draggable="false"></div>
    </div>
  </div>
</template>
<script lang="ts">
import {computed, defineComponent, onMounted, ref, toRaw, watch} from 'vue';
import {createColorByHue, getColorHex, getColorHSV, getColorHue, transformColorBySaturation} from './util';

export default defineComponent({
  name: 'color-saturation',
  emits: ['change', 'update:color'],
  props: {
    color: {
      type: String,
      default: 'red',
    },
  },
  setup(props, { emit }) {
    const picker = ref();
    const pointer = ref();
    const bgColor = ref('red');
    let baseColor = toRaw(props.color);// 基准色，因为在调整pointer的时候，仅仅是在修改基准色的饱和度

    function updateBaseColor(color: string) {
      baseColor = color;
      updateView(color);
    }

    function updateView(str: string) {
      const pointerEl: HTMLDivElement = pointer.value as HTMLDivElement;
      const { s, v } = getColorHSV(str);
      pointerEl.style.left = `${s * 100}%`;
      pointerEl.style.top = `${(1 - v) * 100}%`;

      const hue = getColorHue(str);
      bgColor.value = `#${createColorByHue(hue)}`;
    }

    watch(() => props.color, (v) => {
      updateView(v);
    });
    onMounted(() => {
      updateView(props.color);
    });
    return {
      bgColor, pointer, picker, updateBaseColor,
      onPickerPointerMouseDown(event: MouseEvent) {
        let updatePointer = (e: MouseEvent) => {
          const pointerEl: HTMLDivElement = pointer.value as HTMLDivElement;
          const pickerEl: HTMLDivElement = picker.value as HTMLDivElement;
          const rect: DOMRect = pickerEl.getBoundingClientRect();
          let left = (e.clientX - rect.left) / rect.width * 100;
          left = left > 100 ? 100 : left;
          left = left < 0 ? 0 : left;
          pointerEl.style.left = `${left}%`;
          let top = (e.clientY - rect.top) / rect.height * 100;
          top = top > 100 ? 100 : top;
          top = top < 0 ? 0 : top;
          pointerEl.style.top = `${top}%`;
          let saturation = left / 100;
          let bright = 1 - top / 100;
          let color = transformColorBySaturation(baseColor, saturation, bright);
          emit('update:color', color);
          emit('change', color);
        };
        let upCallback = (e: MouseEvent) => {
          document.removeEventListener('mousemove', updatePointer);
          document.removeEventListener('mouseup', upCallback);
        };
        document.addEventListener('mousemove', updatePointer);
        document.addEventListener('mouseup', upCallback);
        updatePointer(event);
      },
    };
  },
});
</script>
<style scoped lang="less">
.picker {
  width: 100%;
  height: 100px;
  position: relative;
  overflow: hidden;

  .pointer {
    position: relative;
    width: 0;
    height: 0;
    left: 50%;
    top: 50%;

    .shape1 {
      pointer-events: none;
      box-sizing: border-box;
      position: absolute;
      margin-left: -9px;
      margin-top: -9px;
      border-radius: 9px;
      width: 18px;
      height: 18px;
      border: 3px solid #3f3844;
    }

    .shape2 {
      pointer-events: none;
      box-sizing: border-box;
      position: absolute;
      margin-left: -6px;
      margin-top: -6px;
      border-radius: 6px;
      width: 12px;
      height: 12px;
      border: 3px solid white;
    }
  }

  .white {
    position: absolute;
    pointer-events: none;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, rgba(255, 255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%);
  }

  .black {
    position: absolute;
    pointer-events: none;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 255) 100%);
    width: 100%;
    height: 100%;
  }


}

</style>