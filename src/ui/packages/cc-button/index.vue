<template>
  <div class="btn"
       :style="{background:`${theme.background}`}"
       @mouseup="onMouseup"
       @mousedown="onMousedown"
       @mouseenter="onMouseenter"
       @mouseleave="onMouseleave"
       :class="{'click':isClick}"
  >
    <div class="text">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { Transition } from './transition';

export default defineComponent({
  name: 'cc-button',
  props: {
    transition: {
      type: String,
      default: 'color',
      validator: (value) => {
        return !!['color', 'sprite'].find(el => el === value)
      }
    },
    color: {
      type: String,
    },
    texture: {
      type: String
    }
  },
  emits: [],
  setup(props: any, { emit }) {

    const isClick = ref(false);
    const isHover = ref(false);
    const transition = new Transition(props.transition, props);

    return {
      theme: transition.theme,
      isClick,
      onMouseup() {
        isClick.value = false;
        transition.onMouseup();
      },
      onMousedown() {
        isClick.value = true;
        transition.onMousedown();
      },
      onMouseenter() {
        isHover.value = true;
        transition.onMouseenter();
      },
      onMouseleave() {
        isHover.value = false;
        transition.onMouseleave();
      },
    };
  },
});
</script>

<style scoped lang="less">
.btn {
  box-sizing: border-box;
  min-width: 10px;
  height: 26px;
  border: 1px solid #171717;
  border-radius: 5px;
  font-family: -apple-system;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 0 1px;
  cursor: pointer;

  .text {
    padding: 0 18px;
    user-select: none;
    color: white;
    font: 1rem bold;
  }
}

.click {
  border-color: #fd942b;
}
</style>
