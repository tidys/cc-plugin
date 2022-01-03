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
  flex-direction: row;
  align-items: center;
  justify-content: center;

  .name {
    margin-left: 10px;
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    width: 35%;
    font-size: 1em;
    color: #bdbdbd;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .name-blue {
    color: #09f !important;
  }

  .value {
    display: flex;
    flex: 1;
  }
}
</style>
