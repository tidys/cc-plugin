<template>
  <div class="root">
    <div class="title">{{ curTitle }}</div>
    <input class="input"
           @keydown.enter="onChange"
           v-model="curColor" @change="onChange"/>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, toRaw, watch} from 'vue';
import {checkColor} from '@/rich-text-editor/color/util';

export default defineComponent({
  name: 'color-input',
  emits: ['change', 'update:color'],
  props: {
    title: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#818181',
    },
  },
  setup(props, { emit }) {
    const curColor = ref(props.color);
    const curTitle = ref(props.title);
    let preColor = toRaw(props.color);

    watch(() => props.color, (v) => {
      updateAndFormatColor(v);
    });
    function fillColorHead(color:string) {
      if (!color.startsWith('#')) {
        color = `#${color}`;
      }
      return color;
    }
    function updateAndFormatColor(str:string) {
      const color = checkColor(str);
      if (color) {
        curColor.value = preColor = fillColorHead(color);
        return true;
      } else {
        curColor.value = preColor = fillColorHead(preColor);
        return false;
      }
    }
    return {
      curColor, curTitle,
      onChange() {
        if (updateAndFormatColor(curColor.value)) {
          const color = curColor.value;
          emit('update:color', color);
          emit('change', color);
        }
      },
    };
  },
});
</script>

<style scoped lang="less">
.root {
  display: flex;
  flex-direction: row;
  font-size: 12px;

  .title {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999999;
    background-color: #ffffff;

  }

  .input {
    flex: 1;
    min-width: 0;
    outline: 1px yellow;
    background: #ffffff;
    border: 1px solid #363636;
    box-sizing: border-box;
    padding: 0 2px;

  }
}
</style>