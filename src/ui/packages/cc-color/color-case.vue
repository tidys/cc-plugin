<template>
  <div class="color-case"
       @mouseenter="isHover=true"
       @mouseleave="isHover=false"
       :style="{'backgroundColor':`#${colorHex}`}">
    <div v-show="isHover" class="label"
         :style="{color:`#${labelColor}`}"
    >#{{ colorHex }}
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent, ref} from 'vue';
// @ts-ignore
import tinycolor from 'tinycolor2';

export default defineComponent({
  name: 'color-case',
  props: {
    color: {
      type: String,
      default: 'red',
    },
  },
  setup(props, { emit }) {
    const color = tinycolor(props.color);
    const colorHex = ref(color.toHex());
    const rgb = color.toRgb();
    rgb.r = 255 - rgb.r;
    rgb.g = 255 - rgb.g;
    rgb.b = 255 - rgb.b;
    const reverseColor = tinycolor(rgb);
    reverseColor.darken(40);
    const labelColor = ref(reverseColor.toHex());
    const isHover = ref(false);
    return {
      isHover,
      colorHex,
      labelColor,
    };
  },
});
</script>
<style scoped lang="less">
.color-case {
  min-width: 50px;
  height: 20px;
  cursor: pointer;
  border: 1px solid transparent;
  box-sizing: border-box;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  .label {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    line-height: 10px;
    font-size: 10px;
  }
}

.color-case:hover {
  border: 1px solid black !important;
}
</style>