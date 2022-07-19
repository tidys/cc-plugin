<template>
  <div class="cc-color">
    <div class="color" :style="style" @click.stop.prevent="show=!show;"></div>
    <div class="color-panel" v-show="show||true" @click.stop.prevent>
      <ColorSaturation :color="curColor" @change="onColorSaturationChange"></ColorSaturation>
      <Hue class="board" title="" v-model:color="curColor" @change="onColorChange"></Hue>
      <Alpha v-show="alpha" class="board" title="" v-model:color="curColor" @change="onColorChange"></Alpha>
      <ColorInput title="HEX:" v-model:color="curColor"></ColorInput>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from 'vue';
import Hue from './hue.vue';
import ColorInput from './color-input.vue';
import Alpha from './alpha.vue';
import ColorSaturation from '@/rich-text-editor/color/saturation.vue';
import {Emitter, EmitterMsg, getColorHex, getColorHex8} from './util';

export default defineComponent({
  name: 't-color',
  emits: ['update:color', 'change'],
  components: { ColorSaturation, ColorInput, Hue, Alpha },
  props: {
    color: { type: String, default: '#ff0000ff' },
    alpha: {type: Boolean, default: false},
  },
  setup(props, { emit }) {
    const show = ref(false);
    const curColor = ref(props.color);
    const style = ref({
      backgroundColor: 'red',
    });
    onMounted(() => {
      document.addEventListener('click', () => {
        show.value = false;
      });
    });

    function updateBgColor() {
      const color = curColor.value;
      const colorHex8 = getColorHex8(color);
      const colorHex = getColorHex(color);
      style.value.backgroundColor = `#${colorHex8}`;
      emit('update:color', colorHex8);
      // 回调值(rgb,rgba)
      emit('change', colorHex, colorHex8);
    }

    return {
      curColor, style, show,
      onColorSaturationChange(color: string) {
        curColor.value = color;
        updateBgColor();
      },
      onColorChange(color: string) {
        Emitter.emit(EmitterMsg.UpdateColor, color);
        updateBgColor();
      },
    };
  },
});
</script>

<style scoped lang="less">
.cc-color {
  flex: 1;
  height: 20px;
  width: 100px;

  .color {
    width: 100px;
    height: 20px;
    cursor: pointer;
    border: 1px solid black;
    box-sizing: border-box;
  }

  .color-panel {
    display: flex;
    flex-direction: column;
    background-color: white;
    position: absolute;
    width: 100px;
    height: 140px;
    border: 1px solid #575757;
    border-top: transparent;
    box-sizing: border-box;

    .board {
      border: 1px solid black;
      box-sizing: border-box;
      margin: 1px 0;
    }
  }
}
</style>