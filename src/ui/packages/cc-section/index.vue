<template>
  <div class="cc-section">
    <div class="header">
      <div @click.stop="fold=!fold" class="fold" :class="fold?'arrow-right':'arrow-down'"></div>
      <slot name="header"></slot>
    </div>
    <slot v-if="!fold"></slot>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'cc-section',
  setup(props, { emit }) {
    const fold = ref(false)
    return { fold }
  }
})
</script>
<style scoped lang="less">
.cc-section {
  .header {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: left;

    .fold {
      cursor: pointer;
    }

    .arrow-right {
      border: 10px solid transparent;
      border-left: 20px solid #fd942b;
      border-right: 0;
    }

    .arrow-down {
      border: 10px solid transparent;
      border-top: 20px solid #fd942b;
      border-bottom: 0;
    }
  }
}
</style>
