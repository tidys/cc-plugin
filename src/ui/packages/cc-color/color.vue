<template>
  <div class="cc-color">
    <div class="color" :style="style" @click.stop.prevent="onShowPanel" @mousedown.stop.prevent></div>
    <div class="color-panel" v-show="show" @click.stop.prevent>
      <ColorSaturation ref="saturationComp" :color="hexColor" @change="onColorChangeSaturation"></ColorSaturation>
      <Hue class="board" title="" v-model:hue="hueValue" @change="onChangeColorHue"></Hue>
      <ColorInput title="HEX:" v-model:color="hexColor" @change="onColorChangeHex" @focusin="onFocusin"></ColorInput>
      <div class="colors">
        <ColorCase class="color-item"
                   @click.prevent.stop="onColorListSelect(item)"
                   v-for="(item, index) in colorList" :key="index" :color="item">
        </ColorCase>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref, watch} from 'vue';
import Hue from './hue.vue';
import ColorInput from './color-input.vue';
import Alpha from './alpha.vue';
import ColorSaturation from './saturation.vue';
import {getColorHex, getColorHex8, getColorHue, transformColorByHue} from './util';
import ColorCase from './color-case.vue';

export default defineComponent({
  name: 't-color',
  emits: ['update:color', 'change'],
  components: { ColorCase, ColorSaturation, ColorInput, Hue, Alpha },
  props: {
    color: { type: String, default: '#ff0000ff' },
    alpha: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const show = ref(false);
    const hexColor = ref(props.color);
    const hueValue = ref(getColorHue(props.color));
    const style = computed(
        () => {
          return {
            backgroundColor: `${getColorHex(props.color)}`,
          };
        },
    );
    onMounted(() => {
      document.addEventListener('click', () => {
        show.value = false;
      });
    });
    watch(() => props.color, (val: string) => {
      hexColor.value = val;
    });

    function updateBgColor() {
      const color = hexColor.value;
      const colorHex8 = getColorHex8(color);
      const colorHex = getColorHex(color);
      style.value.backgroundColor = `${colorHex8}`;
      emit('update:color', colorHex8);
      // 回调值(rgb,rgba)
      emit('change', colorHex, colorHex8);
    }

    const colorList = ref<Array<string>>([
      '#39352f', '#43aa05', '#cf2831', '#2297fe',
      '#dc50ff', '#ff6400', '#e6dcc8', '#f8b551',
    ]);
    const saturationComp = ref();
    return {
      saturationComp,
      colorList,
      hexColor,
      hueValue,
      style, show,
      onShowPanel() {
        show.value = !show.value;
        if (show.value) {
          hueValue.value = getColorHue(hexColor.value);
          saturationComp.value.updateBaseColor(hexColor.value);
        }
      },
      onColorChangeSaturation(color: string) {
        // 颜色饱和度发生改变
        hexColor.value = color;
        updateBgColor();
      },
      onChangeColorHue(color: string) {
        // 色相发生改变
        hexColor.value = transformColorByHue(hexColor.value, hueValue.value);
        saturationComp.value.updateBaseColor(hexColor.value);
        updateBgColor();
      },
      onColorChangeHex(color: string) {
        hexColor.value = color;
        hueValue.value = getColorHue(color);
        saturationComp.value.updateBaseColor(hexColor.value);
        updateBgColor();
      },
      onColorListSelect(color: string) {
        hexColor.value = color;
        hueValue.value = getColorHue(color);
        saturationComp.value.updateBaseColor(hexColor.value);
        updateBgColor();
        show.value = false;
      },

      onFocusin(event: FocusEvent) {
        (event.target as HTMLInputElement).select();
      },
    };
  },
});
</script>

<style scoped lang="less">
.cc-color {
  flex: 1;
  height: 20px;
  width: 120px;

  .color {
    width: 100%;
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
    width: 150px;
    height: 226px;
    border: 1px solid #575757;
    border-top: transparent;
    box-sizing: border-box;

    .board {
      border: 1px solid black;
      box-sizing: border-box;
      margin: 1px 0;
    }

    .colors {
      display: flex;
      flex-wrap: wrap;
      margin: 2px;

      .color-item {
        flex: 1;
      }
    }
  }
}
</style>