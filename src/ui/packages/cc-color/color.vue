<template>
  <div class="cc-color">
    <div class="color" :style="style">

    </div>
    <div class="color-hue">
      <div class="picker" draggable="false" ref="picker" @mousedown.self="onPickerPointerMouseDown">
        <div class="bg1" draggable="false"></div>
        <div class="bg2" draggable="false"></div>
        <div class="pointer" ref="pointer" draggable="false">
          <div class="shape1" draggable="false"></div>
          <div class="shape2" draggable="false"></div>
        </div>
      </div>
      <hue title="颜色"></hue>
      <hue title="透明度"></hue>
      <rgb title="HEX"></rgb>
      <rgb title="RGBA"></rgb>
    </div>

  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import Hue from "./hue.vue";
import Rgb from "./rgb.vue";
//https://github.dev/anish2690/vue-color-kit
export default defineComponent({
  name: "cc-color",
  components: { Rgb, Hue },
  props: {
    color: { type: String, default: "red" }
  },
  setup(props, { emit }) {
    const color = ref(props.color);
    const pointer = ref();
    const picker = ref();
    const style = ref({});
    style.value.backgroundColor = 'red';
    return {
      color, pointer, picker, style,
      onPickerPointerMouseDown(event) {
        let updatePointer = (e) => {
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
        };
        let upCallback = (e) => {
          document.removeEventListener('mousemove', updatePointer);
          document.removeEventListener('mouseup', upCallback);
        };
        document.addEventListener('mousemove', updatePointer);
        document.addEventListener('mouseup', upCallback);
        updatePointer(event);
      },
    }
  }
})
</script>

<style scoped lang="less">
.cc-color {
  background: red;
  flex: 1;
  height: 20px;

  .color {
    width: 100px;
    height: 20px;
  }

  .color-hue {
    display: flex;
    flex-direction: column;

    position: absolute;
    width: 100px;
    height: 140px;

    .picker {
      width: 100%;
      height: 100px;
      position: relative;

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

      .bg1 {
        position: absolute;
        pointer-events: none;
        width: 100%;
        height: 100%;
        background: linear-gradient(to right, rgba(255, 255, 255, 255) 0%, rgba(255, 255, 255, 0) 100%);
      }

      .bg2 {
        pointer-events: none;
        position: absolute;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 255) 100%);
        width: 100%;
        height: 100%;
      }


    }


  }
}
</style>