<template>
  <div class="checkbox">
    <input type="checkbox" v-model="val" @change="onChange">
    <span class="text" v-if="label.length">{{ label }}</span>
    <slot name="label"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'cc-checkbox',
  emits: ['update:value', 'change'],
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    }
  },
  setup(props, { emit }) {
    const val = ref(props.value);
    const label = ref(props.label);
    watch(() => props.value, (v) => {
      val.value = v;
    });
    return {
      val,
      label,
      onChange() {
        const v = val.value;
        emit('update:value', v);
        emit('change', v);
      },
    };
  },
})
</script>

<style scoped lang="less">
.checkbox {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  .text {
    white-space: nowrap;
    font-size: 13px;
  }
}
</style>