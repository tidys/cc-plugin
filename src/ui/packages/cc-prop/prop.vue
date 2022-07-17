<template>
  <div class="cc-prop"
       @mouseenter="isHove=true"
       @mouseleave="isHove=false"
  >
    <div class="name" :class="isHove?'name-blue':''">
      {{ name }}
    </div>
    <div class="value">
      <slot style="flex:1;"></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'cc-prop',
  props: {
    name: {
      type: String,
    }
  },
  setup(props, { emit }) {
    const name = ref(props.name || '')
    const isHove = ref(false);
    return {
      name,
      isHove,
    }
  }
})
</script>

<style scoped lang="less">
.cc-prop {
  display: flex;
  width: 100%;
  height: 26px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin: 2px 0;
  overflow: hidden;

  .name {
    user-select: none;
    margin-left: 15px;
    display: block;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    font-size: 12px;
    color: #bdbdbd;
    width: 35%;
    min-width: 35%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .name-blue {
    color: #09f !important;
  }

  .value {
    overflow: hidden;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }
}
</style>
