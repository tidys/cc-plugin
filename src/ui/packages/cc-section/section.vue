<template>
  <div class="cc-section">
    <div class="header">
      <div class="left" @click.stop="fold=!fold">
        <div class="fold" :class="fold?'arrow-right':'arrow-down'"></div>
        <div class="title">{{ name }}</div>
      </div>
      <slot name="header"></slot>
    </div>
    <slot v-if="!fold"></slot>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'cc-section',
  props: {
    name: {
      type: String
    }
  },
  setup(props, { emit }) {
    const fold = ref(false);
    const name = ref(props.name || '');
    return { fold, name }
  }
})
</script>
<style scoped lang="less">
.cc-section {
  .header {
    height: 26px;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: left;
    border-bottom: 1px solid #666666;
    color: #bdbdbd;

    .left {
      cursor: pointer;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }

    .title {
      //color: #bdbdbd;
      color: #11ff00;
      user-select: none;
      font-size: 12px;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fold {
      margin: 0 3px;
    }

    .arrow-right {
      border: 4px solid transparent;
      border-left: 8px solid #bdbdbd;
      border-right: 0;
    }

    .arrow-down {
      border: 4px solid transparent;
      border-top: 7px solid #bdbdbd;
      border-bottom: 0;
    }
  }
}
</style>
