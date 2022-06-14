<template>
  <div class="root">
    <div class="title">{{ title }}</div>
    <input class="input" :value="value"/>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'

export default defineComponent({
  name: "rgb",
  props: {
    title: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '#000',
    }
  },
  setup(props, { emit }) {
    const value = ref(props.value);
    const title = ref(props.title)
    return {
      value, title,
    }
  }
})
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
    background-color: #252930;

  }

  .input {
    flex: 1;
    outline: 1px yellow;
    background: #2e333a;
    box-sizing: border-box;
    border: 0;
    padding: 0 10px;

  }
}
</style>